import { ReactNode, useEffect, useState } from "react";

import { useAI } from "@/hooks/ai";
import { useFFmpeg } from "@/hooks/ffmpeg";
import { getMimeType } from "@/lib/utils";
import { FileDisplay } from "@/components/file-display";
import { FileMetadata } from "@/types/FileMetadata.types";
import { createFFmpegTools, ToolResult } from "@/lib/tools";
import { debug } from "@/lib/debug";

type Message = {
  role: "agent" | "assistant" | "user";
  content: string | React.ReactNode;
};

let fileMetadata: FileMetadata;

export const useChatMessages = () => {
  const { prompt, supports } = useAI();
  const { transcodeFile, getFile } = useFFmpeg();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: "Hi, try using natrual language to edit an uploaded video",
    },
    {
      role: "agent",
      content:
        'For example you could type "Remove audio". This would look for an uploaded video and remove any audio tracks and give you back a silent video',
    },
    ...(supports
      ? []
      : ([
          {
            role: "agent",
            content: "Bummer, looks like your device doesn't support Chrome AI",
          },
        ] as const)),
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const llm = async () => {
      await getFFmpegCmd();
    };

    llm();
  }, [messages]);

  const setMediaMessage = (media: ReactNode) => {
    setEphemeralMessage(media, "agent");
  };

  const setEphemeralMessage = (
    input: Message["content"],
    role?: Message["role"]
  ) => {
    const newMessages = messages.filter((msg) => msg.role !== "assistant");
    setMessages([
      ...newMessages,
      {
        role: role ?? "assistant",
        content: input,
      },
    ]);
  };

  const getFFmpegCmd = async () => {
    const latestMessage = messages[messages.length - 1];

    if (
      latestMessage.role === "user" &&
      typeof latestMessage.content === "string"
    ) {
      setEphemeralMessage("Thinking...");

      const tools = createFFmpegTools({
        transcodeFile,
        fileMetadata,
      });

      const result = await prompt(latestMessage.content, tools);

      if (result.toolCalls.length > 0) {
        const lastToolCall = result.toolCalls[result.toolCalls.length - 1];
        const toolResult = lastToolCall.result as ToolResult;
        debug.result(lastToolCall.toolName, toolResult);
        
        if (toolResult.success && toolResult.outputFile) {
          setEphemeralMessage("Done!");
          // Load and display the output file
          const [fileExt] = toolResult.outputFile.split(".").reverse();
          const outputMimetype = getMimeType(fileExt);
          const fileURL = await getFile(toolResult.outputFile, outputMimetype);

          setMediaMessage(
            FileDisplay({ src: fileURL, type: outputMimetype, ext: fileExt })
          );
        } else {
          // Tool failed - error was already fed back to LLM for retry
          // If we're here, retries exhausted
          setMessages([...messages, {
            role: "agent",
            content: `Failed: ${toolResult.message}. Error: ${toolResult.error}`,
          }]);
        }
      } else {
        // No tool called
        debug.log("No tool called - model didn't select any tool");
        setMessages([...messages, {
          role: "agent",
          content: "I'm not sure how to do that. Try something like 'convert to mp4' or 'scale to 720p'.",
        }]);
      }
    }
  };

  const handleMessage = async (metadata: FileMetadata) => {
    if (!input.trim()) return;
    fileMetadata = metadata;

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
  };

  return { messages, input, setInput, handleMessage };
};
