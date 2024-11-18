import { useState } from "react";
import { useFFmpeg } from "./hooks/ffmpeg";
import "./App.css";

function App() {
  const { ffmpeg, loading, load } = useFFmpeg();

  return (
    <>
      <h1>NL Video Editing</h1>
      {!loading ? (
        <>
          <h2>FFmpeg loaded: true</h2>
          {`${console.log(ffmpeg)}`}
        </>
      ) : (
        <button onClick={load}>Load ffmpeg-core</button>
      )}
    </>
  );
}

export default App;
