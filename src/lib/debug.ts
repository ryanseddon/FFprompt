const DEBUG_KEY = "ffprompt:debug";

const isDebug = () => localStorage.getItem(DEBUG_KEY) === "true";

export const enableDebug = () => localStorage.setItem(DEBUG_KEY, "true");
export const disableDebug = () => localStorage.removeItem(DEBUG_KEY);

export const debug = {
  tools: (tools: Record<string, any>) => {
    if (!isDebug()) return;
    console.group("🔧 Available Tools");
    Object.keys(tools).forEach((name) => {
      console.log(`  • ${name}`);
    });
    console.groupEnd();
  },

  input: (input: string) => {
    if (!isDebug()) return;
    console.log(`\n📝 User Input: "${input}"`);
  },

  toolCall: (toolName: string, args: Record<string, unknown>) => {
    if (!isDebug()) return;
    console.group(`🎯 Tool Called: ${toolName}`);
    console.log("Arguments:", JSON.stringify(args, null, 2));
    console.groupEnd();
  },

  result: (toolName: string, result: { success: boolean; message: string; outputFile?: string; error?: string }) => {
    if (!isDebug()) return;
    const icon = result.success ? "✅" : "❌";
    console.group(`${icon} ${toolName} Result`);
    console.log("Success:", result.success);
    console.log("Message:", result.message);
    if (result.outputFile) console.log("Output:", result.outputFile);
    if (result.error) console.log("Error:", result.error);
    console.groupEnd();
  },

  step: (step: number, maxSteps: number) => {
    if (!isDebug()) return;
    console.log(`\n📊 Step ${step}/${maxSteps}`);
  },

  error: (error: unknown) => {
    if (!isDebug()) return;
    console.error("🔴 Error:", error);
  },

  log: (msg: string, ...args: any[]) => {
    if (!isDebug()) return;
    console.log(`ℹ️ ${msg}`, ...args);
  },
};

export const isDebugEnabled = () => isDebug();

// Expose to window for easy console access
if (typeof window !== "undefined") {
  (window as any).enableDebug = enableDebug;
  (window as any).disableDebug = disableDebug;
  (window as any).isDebug = isDebugEnabled;
}
