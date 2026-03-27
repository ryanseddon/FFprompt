import { generateText } from "ai";
import { browserAI, doesBrowserSupportBrowserAI } from "@browser-ai/core";
import { nlToCommand, ffmpegNLToCommand, ffmpegArgInterpolator } from "./ffmpeg-commands";

const systemPrompt = `Your job is to get the closest match from the input that matches one of the following comma separated items that appear only within """.

"""
${Object.keys(nlToCommand).join(",")}
"""`;

const initialPrompts = [
  { role: "system" as const, content: systemPrompt },
  { role: "user" as const, content: "turn into gif" },
  { role: "assistant" as const, content: "Convert video to GIF" },
  { role: "user" as const, content: "Get audio" },
  { role: "assistant" as const, content: "Extract audio from video" },
  { role: "user" as const, content: "scale up" },
  { role: "assistant" as const, content: "Change video resolution" },
  { role: "user" as const, content: "turn into a gif" },
  { role: "assistant" as const, content: "Convert video to GIF" },
  { role: "user" as const, content: "get first 10 seconds" },
  { role: "assistant" as const, content: "Trim a video (first 5 seconds)" },
  { role: "user" as const, content: "make it old school" },
  { role: "assistant" as const, content: "Convert video to black and white" },
  { role: "user" as const, content: "convert webp to png" },
  { role: "assistant" as const, content: "Convert file to different format" },
  { role: "user" as const, content: "change png to jpg" },
  { role: "assistant" as const, content: "Convert file to different format" },
];

export const promptWithBrowserAI = async (input: string): Promise<string> => {
  const result = await generateText({
    model: browserAI(),
    messages: [
      ...initialPrompts,
      { role: "user" as const, content: input },
    ],
  });
  return result.text;
};

export const supportsBrowserAI = doesBrowserSupportBrowserAI;

export {
  systemPrompt,
  initialPrompts,
  ffmpegNLToCommand,
  ffmpegArgInterpolator,
};
