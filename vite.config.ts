import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === "development") {
    const { componentTagger } = await import("lovable-tagger");
    plugins.push(componentTagger());
  }

  return {
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:8090',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '/api'),
        },
      },
      hmr: {
        clientPort: 443,
        protocol: "wss",
        path: "/__vite_hmr",
        host: undefined,
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
