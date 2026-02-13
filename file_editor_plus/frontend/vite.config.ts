import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function getAddonVersion(): string {
  try {
    const configDir = path.dirname(fileURLToPath(import.meta.url));
    const candidatePaths = [
      path.resolve(process.cwd(), "config.yaml"),
      path.resolve(configDir, "../config.yaml"),
      path.resolve(configDir, "../../config.yaml"),
      path.resolve(configDir, "../../../config.yaml"),
    ];

    for (const candidatePath of candidatePaths) {
      if (!existsSync(candidatePath)) continue;
      try {
        const addonConfigYaml = readFileSync(candidatePath, "utf8");
        const addonVersionMatch = addonConfigYaml.match(/^version:\s*["']?([^"'\r\n]+)["']?\s*$/m);
        const addonVersion = addonVersionMatch?.[1]?.trim();
        if (addonVersion) return addonVersion;
      } catch {
        // Keep scanning the next candidate path.
      }
    }
  } catch {
    // Fall through to environment fallbacks.
  }

  const envVersion =
    process.env.VITE_ADDON_VERSION ??
    process.env.VITE_APP_VERSION ??
    process.env.npm_package_version ??
    "0.0.0";
  return envVersion.trim() || "0.0.0";
}

const addonVersion = getAddonVersion();

export default defineConfig({
  base: "./",
  define: {
    __APP_VERSION__: JSON.stringify(addonVersion),
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
