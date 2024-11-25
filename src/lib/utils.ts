import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileType(ext: string): string {
  const reImg = /(jpg|jpeg|png|gif|bmp|tiff|webp|svg)/;
  const reAudio = /(mp3|wav|midi)/;
  return reImg.test(ext) ? "image" : reAudio.test(ext) ? "audio" : "video";
}
