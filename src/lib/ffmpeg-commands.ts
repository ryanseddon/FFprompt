// FFmpeg command mappings for natural language to CLI conversion
// -y makes it so the file can be overridden

export const nlToCommand = {
  "Convert file to different format": ["-i", "{{input}}", "-y", "{{output}}"],
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
  "Convert video to mp3": [
    "-i",
    "{{input}}",
    "-c:a",
    "libmp3lame",
    "-q:a",
    "2",
    "{{name}}.mp3",
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
  "Blend pixels together for artsy look": [
    "-i",
    "{{input}}",
    "-filter_complex",
    "[0:v]split[orig][copy];[copy]setpts=PTS+0.4/TB[delayed];[orig][delayed]blend=all_expr='if(lt(mod(X*X+Y*Y,2000),1000),A,B)'",
    "{{output}}",
  ],
} as const;

export type CommandKey = keyof typeof nlToCommand;

export const ffmpegNLToCommand = new Map(Object.entries(nlToCommand));

export const ffmpegArgInterpolator = (
  key: string,
  options: Record<string, string> = {},
) => {
  const cliArgs = ffmpegNLToCommand.get(key);
  const reTemplateVars = /\{\{(.*?)\}\}/g;

  if (cliArgs) {
    return cliArgs.map((arg) =>
      arg.replace(reTemplateVars, (_, key) => options[key]),
    );
  }

  throw Error("No valid commands found");
};

export const commandKeys = Object.keys(nlToCommand);
