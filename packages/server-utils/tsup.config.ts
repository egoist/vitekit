import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["./src/index.ts"],
  dts: true,
  format: ["esm"],
  clean: true,
})
