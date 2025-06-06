# <img src="public/logo.svg" width="26px" /> FFprompt

Attach a video file and use natural language to describe what you want to do to it.

> [!IMPORTANT]
> This only works with Chrome Dev+ that has the built-in AI features enabled

[![YouTube](https://github.com/user-attachments/assets/dd929b60-2fe3-4593-b5b9-500532f2d54b)](https://www.youtube.com/watch?v=D7RBtvDFRo8)

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
    <li>Open dev tools and type `(await LanguageModel.capabilities()).available`, should return "readily" when all good</li>
    <li>If not you can trigger the download by doing the follow:
      ```const session = await LanguageModel.create({monitor(m) {m.addEventListener("downloadprogress", e => {
        console.log(`Downloaded \${e.loaded} of \${e.total} bytes.`);
      });}});```</li>
  </ol>
</details>

![Screenshot of FFprompt UI](public/screenshot.png)

## Run locally

```bash
npm install
npm run dev
```

## How does it work

Using the [Prompt API](https://github.com/explainers-by-googlers/prompt-api) we take in natural language queries and map that to the closest match in a `Map` that holds the actual ffmpeg command e.g.

E.g "Turn into gif" -> Gemini Nano -> "Convert video to GIF"

Looking up that string it returns:

```js
{
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
}
```

This query then interpolates the input and output that is stored when you attach a file to get the actual file names to pass into [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).

## Limitations

Right now this tool will do simple operations, you can see exactly what it can do the [AI class](https://github.com/ryanseddon/FFprompt/blob/3d72a627171239db7c6de901d05c1b33e4baf5d3/src/lib/AI.ts#L20-L99).

Working on large video files isn't terribly fast (it's actually pretty slow), there is a multi threaded version of ffmpeg.wasm and it can also support WORKERFS mounting over the default MEMFS but I haven't explored that yet.
