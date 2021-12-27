#!/usr/bin/env node
import { cac } from "cac"
import { ViteKit } from "./node"

const cli = cac(`vitekit`)

cli.command("[dir]", "Start dev server").action(async (dir) => {
  const kit = new ViteKit({ root: dir })
  await kit.createDevServer()
})

cli.command("build [dir]", "Build for production").action(async (dir) => {
  const kit = new ViteKit({ root: dir })
  await kit.build()
})

cli.parse()
