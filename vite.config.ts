import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [react()];

  if (mode === "development") {
    const { componentTagger } = await import("lovable-tagger");
    plugins.push(componentTagger());
  }

  return {
    server: {
      port: 8080, // Frontend port
      host: "localhost", // Explicit host
      proxy: {
        "/api": {
          target: "http://localhost:8090", // Backend port
          changeOrigin: true,
          rewrite: (pathStr: string) => pathStr.replace(/^\/api/, "/api"),
        },
        // Removed the /__vite_hmr proxy entirely
      },
      hmr: {
        clientPort: 8080, // Should match your frontend port
        // protocol: "ws", // Optional (Vite defaults to ws)
        // host: "localhost", // Optional if already set in server.host
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            lucide: ["lucide-react"],
            radix: [
              "@radix-ui/react-accordion",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-tabs",
              "@radix-ui/react-toast",
            ],
          },
        },
      },
    },
  };
});