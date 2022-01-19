import path from "path"
import fs from "fs-extra"
import { Loader, transform } from "esbuild"
import * as esModuleLexer from "es-module-lexer"

const localRequire = (id: string) => {
  const resolvedId = require.resolve(id, { paths: [process.cwd()] })
  return require(resolvedId)
}

export const parseRouteFile = async (filepath: string) => {
  await esModuleLexer.init

  let content = await fs.readFile(filepath, "utf8")

  let ext = path.extname(filepath)
  let isVue = false

  if (ext === ".vue") {
    isVue = true
    const compiler: typeof import("vue/compiler-sfc") =
      localRequire("vue/compiler-sfc")
    const { descriptor } = compiler.parse(content, { filename: filepath })
    content = descriptor.script?.content || ""
    if (descriptor.script?.lang === "ts") {
      ext = ".ts"
    }
  }

  if (/^\.(jsx|ts|tsx)$/.test(ext)) {
    await transform(content, {
      sourcefile: filepath,
      target: "esnext",
      loader: ext.slice(1) as Loader,
    }).then((res) => {
      content = res.code
    })
  }

  const [, exportNames] = esModuleLexer.parse(content)

  return {
    hasLoader: exportNames.includes("loader"),
    hasAction: exportNames.includes("action"),
    hasDefault: exportNames.includes("default") || isVue,
  }
}
