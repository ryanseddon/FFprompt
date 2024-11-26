import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMimeType(extension: string): string | null {
  if (!extension || typeof extension !== "string") {
    throw new Error("Invalid file extension.");
  }

  const normalizedExtension = extension.toLowerCase().trim();

  const mimeTypes = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",
    tiff: "image/tiff",
    ico: "image/x-icon",

    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",
    m4a: "audio/mp4",
    aac: "audio/aac",

    // Video
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    webm: "video/webm",
    flv: "video/x-flv",
    mpeg: "video/mpeg",
  };

  return mimeTypes[normalizedExtension] || null;
}
