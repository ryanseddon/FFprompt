function FileDisplay({ src, ext }: { src: string; ext: string }) {
  const reImg = /(jpg|jpeg|png|gif|bmp|tiff|webp|svg)/;
  const type = reImg.test(ext) ? "img" : "video";
  return type === "img" ? <img src={src} /> : <video src={src} controls />;
}

export { FileDisplay };
