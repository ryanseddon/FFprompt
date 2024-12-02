import {
  Paperclip,
  FileMusic,
  FileVideo,
  FileImage,
  CircleX,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { fetchFile } from "@ffmpeg/util";
import { useFFmpeg } from "@/hooks/ffmpeg";
import { Button } from "@/components/ui/button";
import { FileMetadata } from "@/types/FileMetadata.types";

type ComponentProps = {
  onChangeHandler: (fileMetadata: FileMetadata) => void;
} & React.HTMLAttributes<HTMLButtonElement>;

const MediaUpload: React.FC<ComponentProps> = ({
  onChangeHandler,
  ...props
}) => {
  const { loadFFmpeg } = useFFmpeg();
  const { toast } = useToast();

  const mountFS = async (file: File): Promise<void> => {
    const ffmpeg = await loadFFmpeg();
    const fileData = await fetchFile(file);

    ffmpeg.on("log", ({ type, message }) => {
      if (message.includes("Stream #0")) {
        const dimensions = message.match(/(\d{2,})x(\d{2,})/);
        if (dimensions) {
          console.log(dimensions);
        }
      }
    });

    await ffmpeg.writeFile(file.name, fileData);
    await ffmpeg.exec(["-i", file.name]);

    onChangeHandler({
      input: file.name,
      type: file.type,
      name: file.name.split(".")[0],
      output: `output_${file.name}`,
    });
  };

  const handleMediaUpload = async (): Promise<void> => {
    const pickerOpts = {
      types: [
        {
          description: "Media files",
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
            "audio/*": [".mp3", ".wav", ".mp4", ".ogg", ".webm"],
            "images/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    };
    // @ts-ignore
    let [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    let file = await fileHandle.getFile();
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > 100) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          "The file is too large, please upload a files smaller than 100MB.",
      });

      return;
    }

    await mountFS(file);
  };

  return (
    <Button size="icon" {...props} onClick={handleMediaUpload}>
      <Paperclip />
      <span className="sr-only">Attach media</span>
    </Button>
  );
};

const FileIcon: React.FC<{ mimetype: string; size: number }> = ({
  mimetype,
  size,
}) => {
  if (mimetype.includes("video/")) {
    return <FileVideo size={size} />;
  } else if (mimetype.includes("audio/")) {
    return <FileMusic size={size} />;
  }

  return <FileImage size={size} />;
};

const Attachment: React.FC<{
  files: FileMetadata[];
  handleRemove: (file: FileMetadata) => void;
}> = ({ files, handleRemove }) => {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    file: FileMetadata
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRemove(file);
    }
  };
  return (
    <ul className="absolute flex top-3 left-3 gap-2 max-w-[95%] overflow-x-auto">
      {files &&
        files.map((file) => {
          return (
            <li
              key={file.input}
              className="flex items-center gap-1 border border-input border-dashed rounded p-2 text-xs"
              title={file.input}
            >
              <FileIcon mimetype={file.type} size={16} />
              <span className="inline-block max-w-28 truncate">
                {file.input}
              </span>
              <button
                onClick={() => handleRemove(file)}
                onKeyDown={(e) => handleKeyDown(e, file)}
              >
                <CircleX size={14} />
                <span className="sr-only">Remove {file.input} attachment</span>
              </button>
            </li>
          );
        })}
    </ul>
  );
};

export { MediaUpload, Attachment };
