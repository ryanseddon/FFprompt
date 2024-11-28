# FFPrompt

Attach a video file and use naturual language to describe what you want to do to it.

> [!IMPORTANT]
> This only works with Chrome Dev+ that has the built-in AI features enabled

<details>
  <summary>Setup Instructions</summary>
  <ol>
    <li>**Install Chrome Dev**: Ensure you have version 127. [Download Chrome Dev](https://google.com/chrome/dev/).</li>
    <li>Check that you’re on 127.0.6512.0 or above</li>
    <li>Enable two flags:
      <ul>
        <li>chrome://flags/#optimization-guide-on-device-model - BypassPerfRequirement</li>
        <li>chrome://flags/#prompt-api-for-gemini-nano - Enabled</li>
      </ul>
    </li>
    <li>Relaunch Chrome</li>
    <li>Navigate to chrome://components</li>
    <li>Check that Optimization Guide On Device Model is downloading or force download if not
    Might take a few minutes for this component to even appear</li>
    <li>Open dev tools and type `(await ai.languageModel.capabilities()).available`, should return "readily" when all good</li>
  </ol>
</details>

## Run locally

```bash
npm install
npm run dev
```

## How does it work

Using the built-in Gemini Nano model we take in natural language queries and map that to the closest match in a `Map` that holds the actual ffmpeg command e.g.

E.g "Turn into gif" -> Gemini Nano -> "Convert video to GIF"

Looking up that string it returns:

```js
{
  "Change video resolution": [
    "-i",
    "{{input}}",
    "-vf",
    "scale=1280:720",
    "-y",
    "{{output}}",
  ],
}
```

This query then interpolates the input and output that is stored when you attach a file to get the actual file names to pass into [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).
