import { generateText, stepCountIs } from "ai";
import { browserAI, doesBrowserSupportBrowserAI } from "@browser-ai/core";
import { debug } from "./debug";

export const promptWithBrowserAI = async (
  input: string,
  tools?: Record<string, any>,
) => {
  debug.input(input);

  if (tools) {
    debug.tools(tools);
  }

  const result = await generateText({
    model: browserAI(),
    messages: [{ role: "user", content: input }],
    ...(tools && {
      tools,
      toolChoice: 'auto' as const,
      stopWhen: stepCountIs(5),
    }),
  });

  if (tools) {
    result.toolCalls.forEach((tc: any) => {
      debug.toolCall(tc.toolName, tc.args);
    });
  }

  if (result.text) {
    debug.log("Model text response:", result.text);
  }

  return result;
};

export const supportsBrowserAI = doesBrowserSupportBrowserAI;
