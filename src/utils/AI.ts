/// <reference types="@types/dom-chromium-ai" />

class AI {
  session: AILanguageModel | null;

  constructor(options: object = {}) {
    this.options = options;
    this.session = null;
  }

  static ready = "readily";

  #getSession = async (option) => {
    window.ai.languageModel.create({ initialPrompts: [] });
    if (window.ai?.languageModel) {
      console.error("Chrome AI not available on this device");
    }

    // Check if we have a session already active
    if (this.session) {
      return this.session;
    }

    // Check if model is available and ready to use
    const { available: canCreate } =
      await window.ai.languageModel.capabilities();

    // canCreateTextSession returns `readily`, `after-download`
    if (canCreate !== AI.ready) {
      console.error(
        "Chrome AI model is not downloaded yet, check chrome://components"
      );
    }

    const { defaultTemperature, defaultTopK } =
      await window.ai.languageModel.capabilities();
    const { temperature, topK, systemPrompt } = Object.assign(
      {},
      this.options,
      options
    );

    this.session = await window.ai.languageModel.create({
      temperature: temperature ? temperature : defaultTemperature,
      topK: topK ? topK : defaultTopK,
      ...(systemPrompt !== undefined && { systemPrompt: systemPrompt }),
    });

    return this.session;
  };

  destroySession() {
    if (this.session) {
      this.session.destroy();
    }
  }

  prompt = async (text, opts = {}) => {
    const session = await this.#getSession(opts);
    console.info("Chrome AI Prompt: \n", text);
    const res = await session.prompt(text);

    return res;
  };
}

export { AI };
