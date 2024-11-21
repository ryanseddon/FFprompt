import { useContext } from "react";
import { FFmpegContext, FFmpegContextType } from "@/components/ffmpeg-provider";

export const useFFmpeg = (): FFmpegContextType => {
  const context = useContext(FFmpegContext);
  if (!context) {
    throw new Error("useFFmpeg must be used within an FFmpegProvider");
  }
  return context;
};
