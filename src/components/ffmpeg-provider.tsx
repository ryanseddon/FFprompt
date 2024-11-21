import { useState, createContext, ReactNode } from "react";
import { FFmpeg } from "@/lib/FFmpeg";

export type FFmpegContextType = {
  loading: boolean;
  transcodeFile: (command: string[]) => Promise<any>;
  loadFFmpeg: () => Promise<FFmpeg["ffmpeg"]>;
};

export const FFmpegContext = createContext<FFmpegContextType | null>(null);

export const FFmpegProvider = ({ children }: { children: ReactNode }) => {
  const [ffmpeg] = useState(new FFmpeg());
  const [loading, setLoading] = useState(false);

  const loadFFmpeg = async (): Promise<FFmpeg["ffmpeg"]> => {
    const ffmpegInstance = ffmpeg.ffmpeg;

    if (!ffmpegInstance.loaded) {
      setLoading(true);
      await ffmpeg.load();
      setLoading(false);
    }

    return ffmpegInstance;
  };

  const transcodeFile = async (command: string[]) => {
    if (!command) {
      console.error("No command was passed");
      return null;
    }

    // const fileName = file.name;
    // const outputFileName = `output_${fileName}`;

    try {
      const ffmpeg = await loadFFmpeg();
      await ffmpeg.readFile("input.mp4");

      await ffmpeg.exec(command);
      const dir = await ffmpeg.listDir("/");
      console.log(dir);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <FFmpegContext.Provider value={{ loading, transcodeFile, loadFFmpeg }}>
      {children}
    </FFmpegContext.Provider>
  );
};
