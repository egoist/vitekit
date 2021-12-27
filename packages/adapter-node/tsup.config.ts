import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  entry: ["./src/server.ts"],
  dts: {
    resolve: true,
  },
  format: ["esm"],
  shims: false,
  external: [".vitekit/routes"],
})
