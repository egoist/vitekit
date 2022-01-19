import { cac } from "cac"
import { ViteKit } from "./node"

export const startCLI = () => {
  const cli = cac(`vitekit`)

  cli.command("[dir]", "Start dev server").action(async (dir) => {
    const kit = new ViteKit({ root: dir, dev: true })
    await kit.createDevServer()
  })

  cli.command("build [dir]", "Build for production").action(async (dir) => {
    const kit = new ViteKit({ root: dir, dev: false })
    await kit.build()
  })

  cli.version(__PKG_VERSION__)
  cli.help()
  cli.parse()
}
