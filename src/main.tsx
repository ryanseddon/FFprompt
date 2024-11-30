import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { FFmpegProvider } from "./components/ffmpeg-provider";
import { AIProvider } from "./components/ai-provider";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FFmpegProvider>
      <AIProvider>
        <App />
        <Toaster />
      </AIProvider>
    </FFmpegProvider>
  </StrictMode>
);
