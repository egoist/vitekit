import { createConfig, createDtsConfig } from "scripts/rollup"

export default [
  createConfig({
    input: {
      cli: "./src/cli.ts",
      node: "./src/node.ts",
      html: "./src/html.ts",
      "shared/server": "./src/shared/server.ts",
      "shared/node-server": "./src/shared/node-server.ts",
      "shared/vite": "./src/shared/vite.ts",
    },
  }),
  createDtsConfig({
    input: {
      node: "./src/node.ts",
      html: "./src/html.ts",
      "shared/server": "./src/shared/server.ts",
      "shared/node-server": "./src/shared/node-server.ts",
      "shared/vite": "./src/shared/vite.ts",
    },
  }),
]
