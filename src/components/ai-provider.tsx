import React, { createContext, ReactNode } from "react";
import { promptWithBrowserAI, supportsBrowserAI } from "@/lib/AI";

export type AIContextType = {
  prompt: (input: string) => Promise<string>;
  supports: boolean;
};

export const AIContext = createContext<AIContextType | null>(null);

export const AIProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <AIContext.Provider
      value={{ prompt: promptWithBrowserAI, supports: supportsBrowserAI() }}
    >
      {children}
    </AIContext.Provider>
  );
};
