#!/usr/bin/env node -r esbuild-register
import path from "path"
import { rollup, watch } from "rollup"

async function main() {
  const configs: any[] = require(path.resolve("build.config.ts")).default

  await Promise.all(
    configs.map(async (config) => {
      if (process.argv.includes("--watch")) {
        watch(config)
      } else {
        const bundle = await rollup(config)
        await bundle.write(config.output as any)
      }
    })
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
