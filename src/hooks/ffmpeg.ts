import { useEffect, useState } from "react";
import { FFmpeg } from "../utils/FFmpeg";

type UseFFmpeg = {
  ffmpeg: FFmpeg | null;
  loading: boolean;
  load?: () => void;
};

export const useFFmpeg = (): UseFFmpeg => {
  const [canLoad, setCanLoad] = useState(false);
  const [state, setState] = useState<UseFFmpeg>({
    ffmpeg: null,
    loading: true,
    load: () => setCanLoad(true),
  });

  useEffect(() => {
    const load = async () => {
      const ffmpeg = new FFmpeg();

      await ffmpeg.load();

      setState({ ffmpeg, loading: false });
    };

    if (canLoad) {
      load();
    }
  }, [canLoad]);

  return state;
};
