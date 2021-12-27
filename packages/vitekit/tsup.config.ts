import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["./src/cli.ts"],
  format: ["esm"],
  banner: {
    js: `import {createRequire as __createRequire} from 'module';var require=__createRequire(import\.meta.url);`,
  },
})
