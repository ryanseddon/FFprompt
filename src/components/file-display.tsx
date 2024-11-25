import { getFileType } from "@/lib/utils";

function FileDisplay({ src, ext }: { src: string; ext: string }) {
  const fileType = getFileType(ext);

  switch (fileType) {
    case "image":
      return <img src={src} />;
      break;
    case "video":
      return <video src={src} controls />;
      break;
    case "audio":
      return <audio src={src} controls />;
      break;
  }
}

export { FileDisplay };
