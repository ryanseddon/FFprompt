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

// -y makes it so the file can be overridden
const nlToCommand = {
  // "Convert video to different format": ["-i", "{{input}}", "{{output}}"],
  "Convert video to mp4": [
    "-i",
    "{{input}}",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-y",
    "{{name}}.mp4",
  ],
  "Extract audio from video": [
    "-i",
    "{{input}}",
    "-q:a",
    "0",
    "-map",
    "a",
    "-y",
    "{{name}}.mp3",
  ],
  // "Convert audio to a different format": ["-i", "{{input}}", "output.mp3"],
  "Trim a video (first 5 seconds)": [
    "-i",
    "{{input}}",
    "-t",
    "5",
    "-c",
    "copy",
    "-y",
    "{{output}}",
  ],
  "Trim a video (from a specific start time)": [
    "-i",
    "{{input}}",
    "-ss",
    "00:00:02",
    "-to",
    "00:00:06",
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-y",
    "{{output}}",
  ],
  "Remove audio from a video": [
    "-i",
    "{{input}}",
    "-an",
    "-c:v",
    "copy",
    "-y",
    "{{output}}",
  ],
  // "Add audio to a video": [
  // "-i",
  // "{{input}}",
  // "-i",
  // "audio.mp3",
  // "-c:v",
  // "copy",
  // "-c:a",
  // "aac",
  // "{{output}}",
  // ],
  "Change video resolution": [
    "-i",
    "{{input}}",
    "-vf",
    "scale=1280:720",
    "-y",
    "{{output}}",
  ],
  "Convert video to GIF": [
    "-i",
    "{{input}}",
    "-vf",
    "fps=10,scale=320:-1:flags=lanczos",
    "-c:v",
    "gif",
    "-y",
    "{{name}}.gif",
  ],
  "Extract video frames (as images)": [
    "-i",
    "{{input}}",
    "-vf",
    "fps=1",
    "-y",
    "{{name}}_%03d.png",
  ],
  "Convert video to black and white": [
    "-i",
    "{{input}}",
    "-vf",
    "hue=s=0",
    "{{output}}",
  ],
};

const systemPrompt = `Your job is to get the closest match from the input that matches one of the following comma separated items that appear only within """.

"""
${Object.keys(nlToCommand).join(",")}
"""`;

const initialPrompts = [
  { role: "system", content: systemPrompt },
  { role: "user", content: "turn into gif" },
  { role: "assistant", content: "Convert video to GIF" },
  { role: "user", content: "Get audio" },
  { role: "assistant", content: "Extract audio from video" },
  { role: "user", content: "scale up" },
  { role: "assistant", content: "Change video resolution" },
  { role: "user", content: "turn into a gif" },
  { role: "assistant", content: "Convert video to GIF" },
  { role: "user", content: "get first 10 seconds" },
  { role: "assistant", content: "Trim a video (first 5 seconds)" },
  { role: "user", content: "make it old school" },
  { role: "assistant", content: "Convert video to black and white" },
];

const ffmpegNLToCommand = new Map(Object.entries(nlToCommand));
const ffmpegArgInterpolator = (
  key: string,
  options: Record<string, string> = {}
) => {
  const cliArgs = ffmpegNLToCommand.get(key);
  const reTemplateVars = /\{\{(.*?)\}\}/g;

  if (cliArgs) {
    return cliArgs.map((arg) =>
      arg.replace(reTemplateVars, (_, key) => options[key])
    );
  }

  throw Error("No valid commands found");
};

class AI {
  session: AILanguageModel | null;
  options: AILanguageModelCreateOptionsWithSystemPrompt;
  supports: boolean;

  constructor(options: object = {}) {
    this.options = options;
    this.session = null;
    this.supports = !!window.ai?.languageModel;
  }

  static ready = "readily";

  #getSession = async (): Promise<AILanguageModel> => {
    if (!window.ai?.languageModel) {
      console.error("Chrome AI not available on this device");
    }

    // Check if we have a session already active
    if (this.session) {
      return this.session.clone();
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
    const {
      temperature = defaultTemperature ?? undefined,
      topK = defaultTopK ?? undefined,
      systemPrompt,
      initialPrompts,
    } = Object.assign({}, this.options);

    this.session = await window.ai.languageModel.create({
      temperature,
      topK,
      ...(systemPrompt !== undefined && { systemPrompt: systemPrompt }),
      ...(initialPrompts !== undefined && { initialPrompts: initialPrompts }),
    });

    return this.session;
  };

  destroySession() {
    if (this.session) {
      this.session.destroy();
    }
  }

  prompt = async (
    input: string,
    options?: AILanguageModelPromptOptions | undefined
  ): Promise<string> => {
    const session = await this.#getSession();
    const res = await session.prompt(input, options);

    return res;
  };
}

export {
  AI,
  systemPrompt,
  initialPrompts,
  ffmpegNLToCommand,
  ffmpegArgInterpolator,
};
