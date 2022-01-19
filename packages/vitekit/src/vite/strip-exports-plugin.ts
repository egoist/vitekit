import { Plugin } from "vite"
import path from "upath"
import { transformAsync } from "@babel/core"
import eliminator from "babel-plugin-eliminator"
import { ROUTE_EXTENSIONS } from "../routes"

type Options = {
  routesDir: string
}

export const stripExportsPlugin = (options: Options): Plugin => {
  return {
    name: "strip-exports",

    enforce: "post",

    async transform(code, id, opts) {
      if (opts?.ssr) return

      if (!id.startsWith(options.routesDir)) return

      const ext = path.extname(id)
      if (!ROUTE_EXTENSIONS.includes(ext)) return

      const result = await transformAsync(code, {
        filename: id,
        configFile: false,
        babelrc: false,
        plugins: [[eliminator, { namedExports: ["loader", "action"] }]],
        sourceMaps: true,
      })

      if (!result) return

      return {
        code: result.code || undefined,
        map: result.map || undefined,
      }
    },
  }
}
