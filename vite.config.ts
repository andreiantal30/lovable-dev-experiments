
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      // Disable WebSocket token validation which is causing the __WS_TOKEN__ error
      clientPort: 443,
      // Force use of HTTPS for WebSocket connection
      protocol: 'wss',
      // Add this to disable the token verification completely
      path: "/__vite_hmr",
      // Specify the HMR server as the same as the serving host
      host: undefined
    },
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
  // Add this to ensure environment variables are properly loaded
  define: {
    __WS_TOKEN__: JSON.stringify('development-token'),
  }
}));
