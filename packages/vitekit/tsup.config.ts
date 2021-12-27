import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["./src/plugin.ts"],
  dts: true,
  format: ["esm"],
})
