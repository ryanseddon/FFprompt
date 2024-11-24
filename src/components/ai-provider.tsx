import React, { createContext, ReactNode } from "react";
import { AI, systemPrompt } from "@/lib/AI";

export type AIContextType = {
  prompt: (
    input: string,
    options?: AILanguageModelPromptOptions | undefined
  ) => Promise<string>;
};

export const AIContext = createContext<AIContextType | null>(null);

export const AIProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  console.log(systemPrompt);
  const localLM = new AI({ systemPrompt });

  return (
    <AIContext.Provider value={{ prompt: localLM.prompt }}>
      {children}
    </AIContext.Provider>
  );
};
