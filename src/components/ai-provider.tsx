import React, { createContext, ReactNode } from "react";
import { promptWithBrowserAI, supportsBrowserAI } from "@/lib/AI";
import type { ToolResult } from "@/lib/tools";

export type AIContextType = {
  prompt: (input: string, tools?: Record<string, any>) => Promise<{ toolCalls: Array<{ toolName: string; result: ToolResult }>; text: string }>;
  supports: boolean;
};

export const AIContext = createContext<AIContextType | null>(null);

export const AIProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const prompt = async (input: string, tools?: Record<string, any>) => {
    const result = await promptWithBrowserAI(input, tools);
    // Map the result to match our expected format
    return {
      toolCalls: result.toolCalls.map((tc: any) => ({
        toolName: tc.toolName,
        result: tc.result as ToolResult,
      })),
      text: result.text,
    };
  };

  return (
    <AIContext.Provider
      value={{ prompt, supports: supportsBrowserAI() }}
    >
      {children}
    </AIContext.Provider>
  );
};
