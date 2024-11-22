import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { FFmpegProvider } from "./components/ffmpeg-provider";
import { AIProvider } from "./components/ai-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FFmpegProvider>
      <AIProvider>
        <App />
      </AIProvider>
    </FFmpegProvider>
  </StrictMode>
);
