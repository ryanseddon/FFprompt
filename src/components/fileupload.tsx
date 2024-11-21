import { Input } from "@/components/ui/input";
import { fetchFile } from "@ffmpeg/util";
import { useFFmpeg } from "@/hooks/ffmpeg";

function FileUpload({
  onChangeHandler,
}: {
  onChangeHandler: (fileName: string) => void;
}) {
  const { loadFFmpeg } = useFFmpeg();
  const handleOnChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      console.log("No file selected");
      return;
    }

    const file = files[0];
    const [fileExt] = file.name.split(".").reverse();

    const fileName = `input.${fileExt}`;

    try {
      const fileData = await fetchFile(file);
      const ffmpeg = await loadFFmpeg();

      await ffmpeg.writeFile(fileName, fileData);
      const dir = await ffmpeg.listDir("/");
    } catch (err) {
      console.error("Error processing file:", err);
    }
  };

  return (
    <Input
      id="video"
      type="file"
      onChange={handleOnChange}
      accept="video/*,audio/*"
    />
  );
}

export { FileUpload };
