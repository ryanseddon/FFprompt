import { useEffect, useState } from "react";
import { AI } from "@/lib/AI";

type UseNano = {
  prompt:
    | ((
        input: string,
        options?: AILanguageModelPromptOptions
      ) => Promise<string>)
    | null;
  loaded: boolean;
};

export const useNano = (
  options: AILanguageModelCreateOptionsWithSystemPrompt
): UseNano => {
  const [state, setState] = useState<UseNano>({ prompt: null, loaded: false });

  useEffect(() => {
    const nano = new AI(options);
    setState({ prompt: nano.prompt, loaded: true });
    () => {
      nano.destroySession();
    };
  }, []);

  return state;
};
