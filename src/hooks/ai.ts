import { useContext } from "react";
import { AIContext, AIContextType } from "@/components/ai-provider";

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }

  return context;
};
