import { useState, createContext, ReactNode } from "react";
import { FFmpeg } from "@/lib/FFmpeg";

export type FFmpegContextType = {
  loading: boolean;
  transcodeFile: (command: string[]) => Promise<any>;
  getFile: (fileName: string, fileExt: string) => Promise<string>;
  loadFFmpeg: () => Promise<FFmpeg["ffmpeg"]>;
};

export const FFmpegContext = createContext<FFmpegContextType | null>(null);

export const FFmpegProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
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

    try {
      const ffmpeg = await loadFFmpeg();
      ffmpeg.on("progress", ({ progress, time }) => {
        console.log(time, progress);
      });
      ffmpeg.on("log", ({ type, message }) => {
        console.log(type, message);
      });

      await ffmpeg.exec(command);
      const dir = await ffmpeg.listDir("/");
      console.log(dir);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const getFile = async (fileName: string, fileExt: string) => {
    const ffmpeg = await loadFFmpeg();
    const fileData = await ffmpeg.readFile(fileName);
    const reImg = /(jpg|jpeg|png|gif|bmp|tiff|webp|svg)/;
    const reAudio = /(mp3|wav|midi)/;
    const fileType = reImg.test(fileExt)
      ? `image/${fileExt}`
      : reAudio.test(fileExt)
        ? `audio/${fileExt}`
        : `video/${fileExt}`;
    const data = new Uint8Array(fileData as ArrayBuffer);
    const objURL = URL.createObjectURL(
      new Blob([data.buffer], { type: fileType })
    );
    console.log(objURL);

    return objURL;
  };

  return (
    <FFmpegContext.Provider
      value={{ loading, transcodeFile, loadFFmpeg, getFile }}
    >
      {children}
    </FFmpegContext.Provider>
  );
};
