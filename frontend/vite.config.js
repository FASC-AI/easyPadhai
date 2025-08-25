import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

// Plugin to remove leading slashes from asset paths
const removeLeadingSlash = () => {
  return {
    name: 'remove-leading-slash',
    generateBundle(options, bundle) {
      Object.keys(bundle).forEach(fileName => {
        if (fileName.endsWith('.html')) {
          const file = bundle[fileName];
          if (file.type === 'asset') {
            file.source = file.source.toString().replace(/src="\//g, 'src="').replace(/href="\//g, 'href="');
          }
        }
      });
    }
  };
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), removeLeadingSlash()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:3000",
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Origin-Agent-Cluster': '?0'
    }
  },
  define: {
    global: 'window',
  },
  build: {
    outDir: path.join(__dirname, "../backend/dist"),
    base: '',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    copyPublicDir: true,
  },
});
