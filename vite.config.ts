
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      tsDecorators: true,
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Define any default env values here if needed
  define: {
    // This is needed for any code that may still reference process.env
    'process.env': {}
  },
  // Disable TypeScript checking to work around missing tsconfig.node.json
  build: {
    outDir: 'dist',
  },
  // Use esbuild for TypeScript transformation without strict config checking
  esbuild: {
    target: 'esnext',
    format: 'esm',
    include: /\.(tsx?|jsx?)$/,
    exclude: /node_modules/
  }
}));
