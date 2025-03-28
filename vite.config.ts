
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      open: true, // Automatically open browser when starting
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Pass environment variables to the client
    define: {
      'import.meta.env.VITE_NEWS_API_KEY': JSON.stringify(env.NEWS_API_KEY),
    },
    build: {
      chunkSizeWarningLimit: 1500, // Increase size limit to suppress chunk warning
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            lucide: ['lucide-react'],
            radix: [
              '@radix-ui/react-accordion',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
            ],
          },
        },
      },
    },
  };
});
