import { Button } from "@/components/ui/button";

function FileDisplay({
  src,
  type,
  ext,
}: {
  src: string;
  type: string;
  ext: string;
}) {
  const [fileType] = type.split("/");
  const props = { src, className: "max-w-screen-sm" };

  switch (fileType) {
    case "image":
      return <img {...props} />;
      break;
    case "video":
      return <video {...props} controls />;
      break;
    case "audio":
      return <audio {...props} controls />;
      break;
    default:
      return (
        <Button variant="link">
          <a href={src} download={`file.${ext}`}>
            Not sure how to render click to download
          </a>
        </Button>
      );
  }
}

export { FileDisplay };
