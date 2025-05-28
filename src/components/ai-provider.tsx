import React, { createContext, ReactNode } from "react";
import { AI, initialPrompts } from "@/lib/AI";

export type AIContextType = {
  prompt: (
    input: string,
    options?: LanguageModelPromptOptions | undefined,
  ) => Promise<string>;
  supports: boolean;
};

export const AIContext = createContext<AIContextType | null>(null);

export const AIProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const localLM = new AI({ initialPrompts });

  return (
    <AIContext.Provider
      value={{ prompt: localLM.prompt, supports: localLM.supports }}
    >
      {children}
    </AIContext.Provider>
  );
};
