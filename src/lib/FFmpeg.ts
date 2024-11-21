import { FFmpeg as FFmpegOG } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export class FFmpeg {
  public ffmpeg: FFmpegOG;
  static baseURL = "ffmpeg";

  constructor() {
    this.ffmpeg = new FFmpegOG();
  }

  public async load() {
    await this.ffmpeg.load({
      coreURL: await toBlobURL(
        `${FFmpeg.baseURL}/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${FFmpeg.baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
  }
}
