import { ReactNode, useEffect, useState } from "react";

import { useAI } from "@/hooks/ai";
import { useFFmpeg } from "@/hooks/ffmpeg";
import { ffmpegNLToCommand, ffmpegArgInterpolator } from "@/lib/AI";
import { getMimeType } from "@/lib/utils";
import { FileDisplay } from "@/components/file-display";
import { FileMetadata } from "@/types/FileMetadata.types";

type Message = {
  role: "agent" | "assistant" | "user";
  content: string | React.ReactNode;
};

let fileMetadata: FileMetadata;

export const useChatMessages = () => {
  const { prompt } = useAI();
  const { transcodeFile, getFile } = useFFmpeg();

  const [messages, setMessages] = useState<Message[]>([
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

  const runFFmpegCmd = async (res: string) => {
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

      // Can't do jsx so just pass the reactnode fn instead, hack for now
      setMediaMessage(FileDisplay({ src: fileURL, type: outputMimetype }));
    } catch (err) {
      console.error(err);
      setMessages([
        ...messages,
        {
          role: "agent",
          content:
            "I'm sorry, but I can't seem to find any files. Did you upload one yet?",
        },
      ]);
    }
  };

  const getFFmpegCmd = async () => {
    const latestMessage = messages[messages.length - 1];

    if (
      latestMessage.role === "user" &&
      typeof latestMessage.content === "string"
    ) {
      setEphemeralMessage("Thinking...");

      const res = await prompt(latestMessage.content);

      if (ffmpegNLToCommand.has(res)) {
        setEphemeralMessage("Transcoding file now...");

        await runFFmpegCmd(res);
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

  const handleMessage = async (metadata: FileMetadata) => {
    if (!input.trim()) return;
    fileMetadata = metadata;

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
  };

  return { messages, input, setInput, handleMessage };
};
