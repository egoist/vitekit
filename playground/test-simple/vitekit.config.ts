import { defineConfig } from "vitekit/node"
import node from "@vitekit/adapter-node"
import vue from "@vitekit/framework-vue"

export default defineConfig({
  plugins: [node(), vue()],
})
