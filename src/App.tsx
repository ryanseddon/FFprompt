import { useState } from "react";
import { Check, Plus, Send } from "lucide-react";

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
import { useFFmpeg } from "@/hooks/ffmpeg";
import { cn } from "@/lib/utils";
import "./App.css";

function App() {
  const { ffmpeg, loading, load } = useFFmpeg();
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content: "Hi, how can I help you today?",
    },
    {
      role: "user",
      content: "Hey, I'm having trouble with my account.",
    },
    {
      role: "agent",
      content: "What seems to be the problem?",
    },
    {
      role: "user",
      content: "I can't log in.",
    },
  ]);
  const [input, setInput] = useState("");
  const inputLength = input.trim().length;

  return (
    <>
      {!loading ? (
        <>
          <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2"></header>
          <Card>
            <CardHeader>
              <CardTitle>Convert files using natural language</CardTitle>
              <CardDescription>
                Drop in a video and/or audio file and describe what you want to
                do
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
                        : "bg-muted"
                    )}
                  >
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
      ) : (
        <Button onClick={load}>Load ffmpeg-core</Button>
      )}
    </>
  );
}

export default App;
