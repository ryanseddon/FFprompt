import { tool } from "ai";
import { z } from "zod";
import { FileMetadata } from "@/types/FileMetadata.types";

export type ToolResult = {
  success: boolean;
  outputFile?: string;
  message: string;
  error?: string;
};

export type ToolDeps = {
  transcodeFile: (command: string[]) => Promise<void>;
  fileMetadata: FileMetadata;
};

export function createFFmpegTools({ transcodeFile, fileMetadata }: ToolDeps) {
  const { input, name, output } = fileMetadata;

  return {
    convertFormat: tool({
      description: "Convert a file to a different format (e.g., webp to png, avi to mp4)",
      inputSchema: z.object({
        outputFormat: z.string().min(1).describe("Target file extension (e.g., 'png', 'mp4')"),
      }),
      execute: async (params: { outputFormat: string }) => {
        const outputFile = `${name}.${params.outputFormat}`;
        const args = ["-i", input, "-y", outputFile];
        try {
          await transcodeFile(args);
          return { success: true, outputFile, message: `Converted to ${params.outputFormat}` };
        } catch (error) {
          return { success: false, message: "Conversion failed", error: String(error) };
        }
      },
    }),

    scaleVideo: tool({
      description: "Change video resolution. Use -1 for height to maintain aspect ratio.",
      inputSchema: z.object({
        width: z.number().min(1).max(7680).describe("Target width in pixels (1-7680)"),
        height: z.union([z.number().min(-1).max(4320), z.literal(-1)]).describe("Target height (1-4320), or -1 for auto"),
      }),
      execute: async (params: { width: number; height: number }) => {
        const h = params.height === -1 ? -1 : params.height;
        const args = ["-i", input, "-vf", `scale=${params.width}:${h}`, "-y", output];
        try {
          await transcodeFile(args);
          return { success: true, outputFile: output, message: `Scaled to ${params.width}x${h === -1 ? "auto" : h}` };
        } catch (error) {
          return { success: false, message: "Scaling failed", error: String(error) };
        }
      },
    }),

    trim: tool({
      description: "Trim/cut video or audio to a segment",
      inputSchema: z.object({
        start: z.string().optional().describe("Start time: seconds ('5') or timestamp ('00:00:05')"),
        end: z.string().optional().describe("End time: seconds ('10') or timestamp ('00:00:10')"),
        duration: z.number().positive().optional().describe("Duration in seconds (alternative to end)"),
      }).refine((data) => data.end || data.duration, {
        message: "Must provide either end time or duration"
      }),
      execute: async (params: { start?: string; end?: string; duration?: number }) => {
        const args = ["-i", input];
        if (params.start) args.push("-ss", params.start);
        if (params.end) args.push("-to", params.end);
        else if (params.duration) args.push("-t", String(params.duration));
        args.push("-c", "copy", "-y", output);
        try {
          await transcodeFile(args);
          return { success: true, outputFile: output, message: "Trimmed successfully" };
        } catch (error) {
          return { success: false, message: "Trim failed", error: String(error) };
        }
      },
    }),

    extractAudio: tool({
      description: "Extract audio track from a video file",
      inputSchema: z.object({
        format: z.enum(["mp3", "wav", "aac"]).optional().describe("Output audio format (default: mp3)"),
      }),
      execute: async (params: { format?: "mp3" | "wav" | "aac" }) => {
        const format = params.format ?? "mp3";
        const outputFile = `${name}.${format}`;
        const args = ["-i", input, "-q:a", "0", "-map", "a", "-y", outputFile];
        try {
          await transcodeFile(args);
          return { success: true, outputFile, message: `Extracted audio as ${format}` };
        } catch (error) {
          return { success: false, message: "Audio extraction failed", error: String(error) };
        }
      },
    }),

    removeAudio: tool({
      description: "Remove all audio from a video",
      inputSchema: z.object({}),
      execute: async () => {
        const args = ["-i", input, "-an", "-c:v", "copy", "-y", output];
        try {
          await transcodeFile(args);
          return { success: true, outputFile: output, message: "Audio removed" };
        } catch (error) {
          return { success: false, message: "Audio removal failed", error: String(error) };
        }
      },
    }),

    convertToGif: tool({
      description: "Convert a video to an animated GIF",
      inputSchema: z.object({
        fps: z.number().min(1).max(60).optional().describe("Frames per second (1-60, default: 10)"),
        width: z.number().min(10).max(1920).optional().describe("Width in pixels (10-1920, default: 320)"),
      }),
      execute: async (params: { fps?: number; width?: number }) => {
        const fps = params.fps ?? 10;
        const width = params.width ?? 320;
        const outputFile = `${name}.gif`;
        const args = [
          "-i", input, "-vf",
          `fps=${fps},scale=${width}:-1:flags=lanczos`,
          "-c:v", "gif", "-y", outputFile,
        ];
        try {
          await transcodeFile(args);
          return { success: true, outputFile, message: "Converted to GIF" };
        } catch (error) {
          return { success: false, message: "GIF conversion failed", error: String(error) };
        }
      },
    }),

    extractFrames: tool({
      description: "Extract video frames as individual image files",
      inputSchema: z.object({
        fps: z.number().min(0.1).max(60).optional().describe("Frames per second to extract (0.1-60, default: 1)"),
        format: z.enum(["png", "jpg"]).optional().describe("Image format (default: png)"),
      }),
      execute: async (params: { fps?: number; format?: "png" | "jpg" }) => {
        const fps = params.fps ?? 1;
        const format = params.format ?? "png";
        const outputPattern = `${name}_%03d.${format}`;
        const args = ["-i", input, "-vf", `fps=${fps}`, "-y", outputPattern];
        try {
          await transcodeFile(args);
          return { success: true, outputFile: outputPattern, message: `Extracted frames at ${fps} fps as ${format}` };
        } catch (error) {
          return { success: false, message: "Frame extraction failed", error: String(error) };
        }
      },
    }),

    applyFilter: tool({
      description: "Apply a visual filter effect to video",
      inputSchema: z.object({
        filter: z.enum(["blackAndWhite", "sepia", "invert", "blur"]).describe("Filter type to apply"),
        intensity: z.number().min(0).max(10).optional().describe("Filter intensity for blur (0-10)"),
      }),
      execute: async (params: { filter: string; intensity?: number }) => {
        const filterMap: Record<string, string> = {
          blackAndWhite: "hue=s=0",
          sepia: "colorbalance=rs=.3:gs=.3:bs=-.3",
          invert: "negate",
          blur: `boxblur=${params.intensity ?? 2}:${params.intensity ?? 2}`,
        };
        const args = ["-i", input, "-vf", filterMap[params.filter], "-y", output];
        try {
          await transcodeFile(args);
          return { success: true, outputFile: output, message: `Applied ${params.filter} filter` };
        } catch (error) {
          return { success: false, message: "Filter application failed", error: String(error) };
        }
      },
    }),

    changeSpeed: tool({
      description: "Change playback speed of video or audio. Speed must be 0.5-2.0 for audio compatibility.",
      inputSchema: z.object({
        speed: z.number().min(0.5).max(2.0).describe("Speed multiplier (0.5 = half, 2.0 = double)"),
      }),
      execute: async (params: { speed: number }) => {
        const args = [
          "-i", input, "-filter:v", `setpts=${1/params.speed}*PTS`,
          "-filter:a", `atempo=${params.speed}`, "-y", output,
        ];
        try {
          await transcodeFile(args);
          return { success: true, outputFile: output, message: `Changed speed to ${params.speed}x` };
        } catch (error) {
          return { success: false, message: "Speed change failed", error: String(error) };
        }
      },
    }),
  };
}
