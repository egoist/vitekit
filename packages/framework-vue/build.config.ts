import { createConfig, createDtsConfig } from "scripts/rollup"

export default [
  createConfig({
    input: {
      index: "./src/index.ts",
      "runtime/index": "./src/runtime/index.ts",
      "runtime/client": "./src/runtime/client.ts",
      "runtime/server": "./src/runtime/server.ts",
    },
    mapExternal: {
      vite: "vitekit/shared/vite.js",
    },
  }),
  createDtsConfig({
    input: {
      index: "./src/index.ts",
      "runtime/index": "./src/runtime/index.ts",
      "runtime/server": "./src/runtime/server.ts",
    },
  }),
]
