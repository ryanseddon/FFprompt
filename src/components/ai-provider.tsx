import React, { createContext, ReactNode } from "react";
import { AI, initialPrompts } from "@/lib/AI";

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
  console.log(initialPrompts);
  const localLM = new AI({ initialPrompts });

  return (
    <AIContext.Provider value={{ prompt: localLM.prompt }}>
      {children}
    </AIContext.Provider>
  );
};
