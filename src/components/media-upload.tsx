import { Paperclip } from "lucide-react";
import { fetchFile } from "@ffmpeg/util";

import { useFFmpeg } from "@/hooks/ffmpeg";
import { Button } from "@/components/ui/button";

function MediaUpload({
  onChangeHandler,
}: {
  onChangeHandler: (fileMetadata: object) => void;
}) {
  const { loadFFmpeg } = useFFmpeg();

  const isFSMounted = async (dir: { name: string; isDir: boolean }[]) =>
    dir.filter((entry) => entry.name === "input").length;

  const mountFS = async (file: File): Promise<void> => {
    const ffmpeg = await loadFFmpeg();
    const inputDir = "/input";
    const inputFile = `${inputDir}/${file.name}`;
    const fileData = await fetchFile(file);

    await ffmpeg.writeFile(file.name, fileData);
    onChangeHandler({
      input: file.name,
      name: file.name.split(".")[0],
      output: `output_${file.name}`,
    });
  };

  const handleMediaUpload = async (): Promise<void> => {
    let fileHandle;
    const pickerOpts = {
      types: [
        {
          description: "Videos",
          accept: {
            "video/*": [
              ".mp4",
              ".m4v",
              ".webm",
              ".avi",
              ".mkv",
              ".mov",
              ".wmv",
            ],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    };
    [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    debugger;

    let file = await fileHandle.getFile();

    await mountFS(file);
  };

  return (
    <Button size="icon" onClick={handleMediaUpload}>
      <Paperclip />
      <span className="sr-only">Attach media</span>
    </Button>
  );
}

export { MediaUpload };
