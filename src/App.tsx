import { useEffect, useRef } from "react";
import { Sparkle, Send } from "lucide-react";

import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload, Attachment } from "@/components/media-upload";
import { useChatMessages } from "@/hooks/chat";
import { useFileOperations } from "@/hooks/files";
import { useAI } from "@/hooks/ai";
import { cn } from "@/lib/utils";
import "./App.css";

function App() {
  const { messages, input, setInput, handleMessage } = useChatMessages();
  const { files, fileMetadata, handleAttachmentRemoval, handleFileUpload } =
    useFileOperations();
  const { supports } = useAI();
  const formRef = useRef<null | HTMLFormElement>(null);
  const scrollRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  const inputLength = input.trim().length;
  console.log(fileMetadata);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="flex flex-col h-screen">
        <CardHeader>
          <CardTitle>FFPrompt</CardTitle>
          <CardDescription>
            Attach a video file and describe what you want to do in the chat
            below.
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
                    ? "flex gap-2 flex-row items-center animate-pulse"
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
              handleMessage(fileMetadata);
            }}
            className="w-full relative"
          >
            <Attachment
              files={files}
              handleRemove={(file) => {
                handleAttachmentRemoval(file);
                textareaRef.current?.focus();
              }}
            />
            <Textarea
              id="message"
              placeholder="Remove audio..."
              className={`flex-1 resize-none ${files.length ? "pt-16" : ""}`}
              autoComplete="off"
              autoFocus={true}
              value={input}
              ref={textareaRef}
              disabled={!supports}
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
                handleFileUpload(fileMetadata);
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
