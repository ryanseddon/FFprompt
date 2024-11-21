import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { FFmpegProvider } from "./components/ffmpeg-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FFmpegProvider>
      <App />
    </FFmpegProvider>
  </StrictMode>
);
