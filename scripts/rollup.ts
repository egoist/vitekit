import path from "path"
import fs from "fs"
import * as chalk from "colorette"
import { builtinModules } from "module"
import { Plugin, RollupOptions } from "rollup"
import esbuild from "rollup-plugin-esbuild"
import nodeResolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import hashbang from "rollup-plugin-hashbang"
import json from "@rollup/plugin-json"
import dts from "rollup-plugin-dts"
import inject from "@rollup/plugin-inject"

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"))

const deps = [
  "vite",
  "vue",
  ...Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies }),
]

const externalPlugin = ({
  mapExternal,
}: { mapExternal?: Record<string, string> } = {}): Plugin => {
  const externalModules = [...deps, ...builtinModules]
  return {
    name: "external",

    resolveId(id) {
      if (
        id.startsWith("node:") ||
        externalModules.some((name) => name === id || id.startsWith(name + "/"))
      ) {
        const resolvedId = (mapExternal && mapExternal[id]) || id
        return {
          id: resolvedId,
          moduleSideEffects: false,
          external: true,
        }
      }
    },
  }
}

const progressPlugin = (): Plugin => {
  const projectName = path.basename(process.cwd())
  let dtsBuild = false

  return {
    name: "progress",
    buildStart(options) {
      dtsBuild = options.plugins.some((p) => p.name === "dts")
      console.log(
        `[${chalk.bold(chalk.cyan(projectName))}] Started ${
          dtsBuild ? "dts" : "rollup"
        } build`
      )
    },
    buildEnd(err) {
      if (err) {
        console.log(
          `[${chalk.bold(chalk.red(projectName))}] Failed ${
            dtsBuild ? "dts" : "rollup"
          } build`
        )
      }
    },
    writeBundle(options, bundle) {
      console.log(
        `[${chalk.bold(chalk.green(projectName))}] Done ${
          dtsBuild ? "dts" : "rollup"
        } build, output files:`
      )
      console.log(
        Object.keys(bundle)
          .sort()
          .map(
            (name) =>
              ` - ${path.relative(
                process.cwd(),
                path.join(options.dir!, name)
              )}`
          )
          .join("\n")
      )
    },
  }
}

const copyPlugin = (files?: Record<string, string>): Plugin => {
  return {
    name: "copy-files",
    async generateBundle() {
      if (!files) return
      for (const fromName in files) {
        const toName = files[fromName]
        this.emitFile({
          type: "asset",
          fileName: toName,
          source: await fs.promises.readFile(fromName),
        })
      }
    },
  }
}

export const createConfig = ({
  input,
  outDir,
  target,
  copy,
  mapExternal,
}: {
  input: string[] | Record<string, string>
  outDir?: string
  target?: "node" | "browser"
  copy?: Record<string, string>
  mapExternal?: Record<string, string>
}): RollupOptions => {
  target = target || "node"

  const injectModules: Record<string, string | [string, string]> = {
    React: "react",
  }
  if (target === "node") {
    injectModules.require = ["REQUIRE", "require"]
  }

  return {
    input,
    output: {
      format: "esm",
      dir: outDir || "./dist",
    },
    treeshake: {
      moduleSideEffects: false,
    },
    plugins: [
      externalPlugin({ mapExternal }),
      progressPlugin(),
      {
        name: "external",
        resolveId(id) {
          if (id.startsWith("/.vitekit/")) {
            return {
              id,
              external: "absolute",
            }
          }
        },
      },
      esbuild({
        target: "node16",
        define: {
          __PKG_VERSION__: JSON.stringify(pkg.version),
          __PKG_NAME__: JSON.stringify(pkg.name),
        },
      }),
      json(),
      hashbang(),
      commonjs({
        ignoreDynamicRequires: true,
      }),
      nodeResolve(),
      inject({
        modules: injectModules,
      }),
      virtualFiles({
        REQUIRE: `
        import { createRequire as _$createRequire } from "module"

        var require = /*@__PURE__*/ _$createRequire(import\.meta.url)

        export { require }

        `,
      }),
      copyPlugin(copy),
    ],
  }
}

export const createDtsConfig = ({
  input,
  outDir,
  copy,
}: {
  input: Record<string, string>
  outDir?: string
  copy?: Record<string, string>
}): RollupOptions => {
  return {
    input,
    output: {
      dir: outDir || "./dist",
    },
    plugins: [
      externalPlugin(),
      progressPlugin(),
      {
        name: "alias",
        resolveId(id) {
          if (id === "upath") {
            return {
              id: "path",
              external: true,
            }
          }
        },
      },
      nodeResolve({
        mainFields: ["types", "typings"],
        moduleDirectories: ["node_modules/@types", "node_modules"],
        extensions: [".d.ts", ".ts"],
      }),
      dts({
        compilerOptions: {
          preserveSymlinks: false,
        },
      }),
      copyPlugin(copy),
    ],
  }
}

const virtualFiles = (files: Record<string, string>): Plugin => {
  return {
    name: "virtual-files",
    resolveId(id) {
      if (id in files) {
        return id
      }
    },
    load(id) {
      if (id in files) {
        return files[id]
      }
    },
  }
}
