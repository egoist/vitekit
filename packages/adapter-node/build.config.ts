import { createConfig, createDtsConfig } from "scripts/rollup"

export default [
  createConfig({
    input: {
      index: "./src/index.ts",
      "runtime/server": "./src/runtime/server.ts",
      "runtime/global": "./src/runtime/global.js",
    },
  }),
  createDtsConfig({
    input: {
      index: "./src/index.ts",
      "runtime/server": "./src/runtime/server.ts",
    },
  }),
]
