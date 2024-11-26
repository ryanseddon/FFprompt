function FileDisplay({ src, type }: { src: string; type: string }) {
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
  }
}

export { FileDisplay };
