import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { legacy: true }],
          ["@babel/plugin-transform-typescript", { allowDeclareFields: true }],
          ["@babel/plugin-proposal-class-properties", { loose: true }]
        ]
      }
    })
  ],
  esbuild: false,
  build: {
    target: "es2020",
    outDir: "dist",
    emptyOutDir: true
  }
});
