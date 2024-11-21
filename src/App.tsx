import { useEffect, useState, createContext } from "react";
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
import { FileUpload } from "@/components/fileupload";
import { useFFmpeg } from "@/hooks/ffmpeg";
import { useNano } from "@/hooks/nano";
import { systemPrompt, ffmpegNLToCommand } from "@/lib/AI";
import { cn } from "@/lib/utils";
import "./App.css";

export const FFmpegContext = createContext(null);

function App() {
  const { transcodeFile } = useFFmpeg();
  const { prompt, loaded: nanoLoaded } = useNano({ systemPrompt });
  const [messages, setMessages] = useState([
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
  const [latestFileName, setLatestFileName] = useState("");
  const inputLength = input.trim().length;

  useEffect(() => {
    const llm = async () => {
      const latestMessage = messages[messages.length - 1];

      if (nanoLoaded && latestMessage.role === "user") {
        setMessages([
          ...messages,
          {
            role: "assistant",
            content: "Thinking...",
          },
        ]);

        const res = await prompt(latestMessage.content);

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
            await transcodeFile(ffmpegNLToCommand.get(res));
          } catch (e) {
            setMessages([
              ...messages,
              {
                role: "agent",
                content:
                  "I'm sorry, but I can't seem to find any files matching that name. Did you upload one yet?",
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
            <FileUpload
              onChangeHandler={(fileName) => setLatestFileName(fileName)}
            />
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
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
          </form>
        </CardFooter>
      </Card>
    </>
  );
}

export default App;
