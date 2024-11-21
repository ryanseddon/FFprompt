/// <reference types="@types/dom-chromium-ai" />
type AICapabilityAvailability = "readily" | "after-download" | "no";

interface AILanguageModelCapabilities {
  readonly available: AICapabilityAvailability;

  readonly defaultTopK: number | null;
  readonly maxTopK: number | null;
  readonly defaultTemperature: number | null;

  supportsLanguage(
    languageTag: Intl.UnicodeBCP47LocaleIdentifier
  ): AICapabilityAvailability;
}

interface AILanguageModelCreateOptions {
  signal?: AbortSignal;
  monitor?: AICreateMonitorCallback;

  topK?: number;
  temperature?: number;
}

interface AILanguageModelCreateOptionsWithSystemPrompt
  extends AILanguageModelCreateOptions {
  systemPrompt?: string;
  initialPrompts?: Array<
    AILanguageModelAssistantPrompt | AILanguageModelUserPrompt
  >;
}

const nlToCommand = {
  "Convert video to different format": ["-i", "video.mov", "output.mp4"],
  "Extract audio from video": [
    "-i",
    "input.mp4",
    "-vn",
    "-acodec",
    "copy",
    "output.mp3",
  ],
  "Convert audio to a different format": ["-i", "video.wav", "output.mp3"],
  "Trim a video (first 5 seconds)": [
    "-i",
    "input.mp4",
    "-t",
    "5",
    "-c",
    "copy",
    "output.mp4",
  ],
  "Trim a video (from a specific start time)": [
    "-i",
    "input.mp4",
    "-ss",
    "00:00:02",
    "-to",
    "00:00:06",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "output.mp4",
  ],
  "Remove audio from a video": [
    "-i",
    "input.mp4",
    "-an",
    "-c:v",
    "copy",
    "output.mp4",
  ],
  "Add audio to a video": [
    "-i",
    "input.mp4",
    "-i",
    "audio.mp3",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "output.mp4",
  ],
  "Change video resolution": [
    "-i",
    "input.mp4",
    "-vf",
    "scale=1280:720",
    "output.mp4",
  ],
  "Convert video to GIF": [
    "-i",
    "input.mp4",
    "-vf",
    "fps=10,scale=320:-1:flags=lanczos",
    "-c:v",
    "gif",
    "output.gif",
  ],
  "Extract video frames (as images)": [
    "-i",
    "input.mp4",
    "-vf",
    "fps=1",
    "image_%03d.png",
  ],
};

const systemPrompt = `Your job is to get the closest match from the input that matches one of the following comma separated items that appear only within """.

"""
${Object.keys(nlToCommand).join(",")}
"""`;

const ffmpegNLToCommand = new Map(Object.entries(nlToCommand));

class AI {
  session: AILanguageModel | null;
  options: AILanguageModelCreateOptionsWithSystemPrompt;

  constructor(options: object = {}) {
    this.options = options;
    this.session = null;
  }

  static ready = "readily";

  #getSession = async (): Promise<AILanguageModel> => {
    window.ai.languageModel.create({ initialPrompts: [] });
    if (!window.ai?.languageModel) {
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
    const { temperature, topK, systemPrompt } = Object.assign({}, this.options);

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

  prompt = async (input: string) => {
    const session = await this.#getSession();
    const res = await session.prompt(input);

    return res;
  };
}

export { AI, systemPrompt, ffmpegNLToCommand };
