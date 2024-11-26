import { ReactNode, useEffect, useState, useRef } from "react";
import { Sparkle, Send } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload, Attachment } from "@/components/media-upload";
import { FileDisplay } from "@/components/file-display";
import { useFFmpeg } from "@/hooks/ffmpeg";
import { useAI } from "@/hooks/ai";
import { ffmpegNLToCommand, ffmpegArgInterpolator } from "@/lib/AI";
import { cn, getMimeType } from "@/lib/utils";
import "./App.css";

function App() {
  const { transcodeFile, getFile, loadFFmpeg } = useFFmpeg();
  const { prompt } = useAI();
  const formRef = useRef<null | HTMLFormElement>(null);
  const scrollRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<
    {
      role: "agent" | "assistant" | "user";
      content: string | ReactNode;
    }[]
  >([
    {
      role: "agent",
      content: "Hi, try using natrual language to edit an uploaded video",
    },
    {
      role: "agent",
      content:
        'For example you could type "Remove audio". This would convert that to an ffmpeg command',
    },
  ]);
  const [input, setInput] = useState("");
  const [fileMetadata, setFileMetadata] = useState<{
    input: string;
    output: string;
    name: string;
    type: string;
  }>({});
  const [files, setFiles] = useState<
    { input: string; name: string; output: string; type: string }[]
  >([]);
  const inputLength = input.trim().length;
  console.log(fileMetadata);

  const handleAttachmentRemoval = async (file) => {
    const ffmpeg = await loadFFmpeg();

    await ffmpeg.deleteFile(file.input);

    const newFiles = [...files].filter((f) => f.input !== file.input);

    setFiles(newFiles);

    if (fileMetadata.input === file.input) {
      setFileMetadata({});
    }

    textareaRef.current?.focus();
  };

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    const container = scrollRef.current;
    if (container) {
      container.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const llm = async () => {
      const latestMessage = messages[messages.length - 1];
      if (typeof latestMessage.content !== "string") {
        // This is a FileDisplay message so just return early
        return;
      }

      if (latestMessage.role === "user") {
        setMessages([
          ...messages,
          {
            role: "assistant",
            content: "Thinking...",
          },
        ]);

        const res = await prompt(latestMessage.content);

        console.log(res);

        if (ffmpegNLToCommand.has(res)) {
          const newMessages = messages.filter(
            (msg) => msg.role !== "assistant"
          );
          setMessages([
            ...newMessages,
            {
              role: "assistant",
              content: "Transcoding file now...",
            },
          ]);

          try {
            const cliArgs = ffmpegArgInterpolator(res, fileMetadata);
            await transcodeFile(cliArgs);
            const output =
              fileMetadata.output !== cliArgs[cliArgs.length - 1]
                ? cliArgs[cliArgs.length - 1]
                : fileMetadata.output;
            const [fileExt] = output.split(".").reverse();

            const outputMimetype = getMimeType(fileExt);

            const fileURL = await getFile(output, outputMimetype);
            const newMessages = messages.filter(
              (msg) => msg.role !== "assistant"
            );
            setMessages([
              ...newMessages,
              {
                role: "agent",
                content: <FileDisplay src={fileURL} type={outputMimetype} />,
              },
            ]);
          } catch (e) {
            console.error(e);
            setMessages([
              ...messages,
              {
                role: "agent",
                content:
                  "I'm sorry, but I can't seem to find any files. Did you upload one yet?",
              },
            ]);
          }
        } else {
          setMessages([
            ...messages,
            {
              role: "agent",
              content:
                "I'm sorry, I'm not sure I can do that. Can you try again with different wording e.g. 'Convert to gif'",
            },
          ]);
        }
      }
    };

    llm();
  }, [messages]);

  return (
    <>
      <div className="flex flex-col h-screen">
        <CardHeader>
          <CardTitle>FFPrompt</CardTitle>
          <CardDescription>
            Drop in a video and/or audio file and describe what you want to do
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 overflow-y-hidden pb-0">
          <div className="space-y-4 overflow-y-auto  max-w-screen-lg pb-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted",
                  message.role === "assistant"
                    ? "flex gap-2 flex-row items-center"
                    : ""
                )}
              >
                {message.role === "assistant" && <Sparkle />}
                {message.content}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </CardContent>
        <CardFooter className="mt-auto">
          <form
            ref={formRef}
            onSubmit={(event) => {
              event.preventDefault();
              if (inputLength === 0) return;
              setMessages([
                ...messages,
                {
                  role: "user",
                  content: input,
                },
              ]);
              setInput("");
            }}
            className="w-full relative"
          >
            <Attachment files={files} handleRemove={handleAttachmentRemoval} />
            <Textarea
              id="message"
              placeholder="Remove audio..."
              className={`flex-1 resize-none ${files.length ? "pt-16" : ""}`}
              autoComplete="off"
              autoFocus={true}
              value={input}
              ref={textareaRef}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (formRef.current) {
                    const event = new Event("submit", {
                      bubbles: true,
                      cancelable: true,
                    });
                    formRef.current.dispatchEvent(event);
                  }
                }
              }}
            />
            <Button
              type="submit"
              className="absolute bottom-2 right-2"
              size="icon"
              disabled={inputLength === 0}
            >
              <Send />
              <span className="sr-only">Send</span>
            </Button>
            <MediaUpload
              className="absolute bottom-2 right-14"
              onChangeHandler={(fileMetadata) => {
                setFileMetadata(fileMetadata);
                setFiles([...files, fileMetadata]);
                textareaRef.current?.focus();
              }}
            />
          </form>
        </CardFooter>
      </div>
    </>
  );
}

export default App;
