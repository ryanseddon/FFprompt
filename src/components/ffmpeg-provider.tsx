import { useState, createContext, ReactNode } from "react";
import { FFmpeg } from "@/lib/FFmpeg";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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

    console.log(`ffmpeg ${command.join(" ")}`);

    const timeoutId = setTimeout(() => {
      toast({
        title: "This operation might take a bit",
        description: "Check the dev tools console to see ffmpeg progress",
      });
    }, 5000);
    try {
      const ffmpeg = await loadFFmpeg();

      ffmpeg.on("log", ({ type, message }) => {
        console.log(message);
      });

      await ffmpeg.exec(command);
      const dir = await ffmpeg.listDir("/");
      console.log(dir);
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const getFile = async (fileName: string, fileType: string) => {
    const ffmpeg = await loadFFmpeg();
    const fileData = await ffmpeg.readFile(fileName);
    const data = new Uint8Array(fileData as ArrayBuffer);
    const objURL = URL.createObjectURL(
      new Blob([data.buffer], { type: fileType })
    );

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
