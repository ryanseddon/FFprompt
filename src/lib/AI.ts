import { generateText, stepCountIs } from "ai";
import { browserAI, doesBrowserSupportBrowserAI } from "@browser-ai/core";

export const promptWithBrowserAI = async (
  input: string,
  tools?: Record<string, any>,
) => {
  const result = await generateText({
    model: browserAI(),
    messages: [{ role: "user", content: input }],
    ...(tools && {
      tools,
      stopWhen: stepCountIs(5),
    }),
  });
  return result;
};

export const supportsBrowserAI = doesBrowserSupportBrowserAI;
