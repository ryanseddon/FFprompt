import { ReactNode, useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { MediaUpload } from "@/components/media-upload";
import { FileDisplay } from "@/components/file-display";
import { useFFmpeg } from "@/hooks/ffmpeg";
import { useAI } from "@/hooks/ai";
import { ffmpegNLToCommand, ffmpegArgInterpolator } from "@/lib/AI";
import { cn } from "@/lib/utils";
import "./App.css";

function App() {
  const { transcodeFile, getFile } = useFFmpeg();
  const { prompt } = useAI();
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
    input?: string;
    output?: string;
  }>({});
  const inputLength = input.trim().length;
  console.log(fileMetadata);

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
            await transcodeFile(ffmpegArgInterpolator(res, fileMetadata));
            const output =
              fileMetadata.output !== cliArgs[cliArgs.length - 1]
                ? cliArgs[cliArgs.length - 1]
                : fileMetadata.output;
            const [fileExt] = output.split(".").reverse();
            const fileURL = await getFile(output, fileExt);
            const newMessages = messages.filter(
              (msg) => msg.role !== "assistant"
            );
            setMessages([
              ...newMessages,
              {
                role: "agent",
                content: <FileDisplay src={fileURL} ext={fileExt} />,
              },
            ]);
          } catch (e) {
            setMessages([
              ...messages,
              {
                role: "agent",
                content:
                  "I'm sorry, but I can't seem to find any files video or audio files. Did you upload one yet?",
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
      <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2"></header>
      <Card>
        <CardHeader>
          <CardTitle>Convert files using natural language</CardTitle>
          <CardDescription>
            Drop in a video and/or audio file and describe what you want to do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
          </div>
        </CardContent>
        <CardFooter>
          <form
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
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="Remove audio..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button type="submit" size="icon" disabled={inputLength === 0}>
              <Send />
              <span className="sr-only">Send</span>
            </Button>
            <MediaUpload
              onChangeHandler={(fileMetadata) => setFileMetadata(fileMetadata)}
            />
          </form>
        </CardFooter>
      </Card>
    </>
  );
}

export default App;
