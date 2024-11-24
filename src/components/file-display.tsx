function FileDisplay({ src, ext }: { src: string; ext: string }) {
  const reImg = /(jpg|jpeg|png|gif|bmp|tiff|webp|svg)/;
  const reAudio = /(mp3|wav|midi)/;
  const type = reImg.test(ext) ? "img" : reAudio.test(ext) ? "audio" : "video";
  switch (type) {
    case "img":
      return <img src={src} />;
      break;
    case "video":
      return <video src={src} controls />;
      break;
    case "audio":
      return <audio src={src} controls />;
      break;
  }
  return type === "img" ? <img src={src} /> : <video src={src} controls />;
}

export { FileDisplay };
