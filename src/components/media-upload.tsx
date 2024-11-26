import {
  Paperclip,
  FileMusic,
  FileVideo,
  FileImage,
  CircleX,
} from "lucide-react";
import { fetchFile } from "@ffmpeg/util";

import { useFFmpeg } from "@/hooks/ffmpeg";
import { Button } from "@/components/ui/button";

type ComponentProps = {
  onChangeHandler: (fileMetadata: object) => void;
} & React.HTMLAttributes<HTMLButtonElement>;

const MediaUpload: React.FC<ComponentProps> = ({
  onChangeHandler,
  ...props
}) => {
  const { loadFFmpeg } = useFFmpeg();

  const mountFS = async (file: File): Promise<void> => {
    const ffmpeg = await loadFFmpeg();
    const fileData = await fetchFile(file);

    await ffmpeg.writeFile(file.name, fileData);
    onChangeHandler({
      input: file.name,
      type: file.type,
      name: file.name.split(".")[0],
      output: `output_${file.name}`,
    });
  };

  const handleMediaUpload = async (): Promise<void> => {
    let fileHandle;
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
    [fileHandle] = await window.showOpenFilePicker(pickerOpts);

    let file = await fileHandle.getFile();

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

const Attachment: React.FC<{ files: [] }> = ({ files, handleRemove }) => {
  const { loadFFmpeg } = useFFmpeg();

  const handleRemoveFile = async (fileName: string) => {
    const ffmpeg = await loadFFmpeg();

    await ffmpeg.deleteFile(fileName);
    const newFiles = [...files].filter((file) => file.input !== fileName);
    setFiles(newFiles);
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
              <button>
                <CircleX
                  size={14}
                  onClick={() => handleRemoveFile(file.input)}
                  aria-label={`Remove ${file.input}`}
                />
              </button>
            </li>
          );
        })}
    </ul>
  );
};

export { MediaUpload, Attachment };
