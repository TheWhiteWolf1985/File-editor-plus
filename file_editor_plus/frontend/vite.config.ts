import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

const addonConfigYaml = readFileSync(new URL("../config.yaml", import.meta.url), "utf8");
const addonVersionMatch = addonConfigYaml.match(/^version:\s*"?([^"\n]+)"?\s*$/m);
const addonVersion = addonVersionMatch?.[1]?.trim() || "unknown";

export default defineConfig({
  base: "./",
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(addonVersion),
  },
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
