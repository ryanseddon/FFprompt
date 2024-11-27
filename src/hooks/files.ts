import { useState } from "react";
import { useFFmpeg } from "@/hooks/ffmpeg";

type FileMetadata = {
  input: string;
  output: string;
  name: string;
  type: string;
};

export const useFileOperations = () => {
  const { loadFFmpeg } = useFFmpeg();
  const [fileMetadata, setFileMetadata] = useState<FileMetadata>(
    {} as FileMetadata
  );
  const [files, setFiles] = useState<FileMetadata[]>([]);

  const handleAttachmentRemoval = async (file: FileMetadata) => {
    const ffmpeg = await loadFFmpeg();
    await ffmpeg.deleteFile(file.input);

    setFiles(files.filter((f) => f.input !== file.input));

    if (fileMetadata.input === file.input) {
      setFileMetadata({} as FileMetadata);
    }
  };

  const handleFileUpload = (fileMetadata: FileMetadata) => {
    setFileMetadata(fileMetadata);
    setFiles((prev) => [...prev, fileMetadata]);
  };

  return { files, fileMetadata, handleAttachmentRemoval, handleFileUpload };
};
