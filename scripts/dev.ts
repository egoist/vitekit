import * as chalk from "colorette"
import { execa } from "execa"
import prompts from "prompts"

type WorkspacePackage = { name: string; version?: string; path: string }

const getPackages = async () => {
  const { stdout } = await execa("pnpm", [
    "ls",
    "-r",
    "--depth",
    "-1",
    "--json",
  ])

  return (JSON.parse(stdout) as WorkspacePackage[]).filter(
    (p) => p.name !== "vitekit-workspace"
  )
}

const runScripts = async (packages: WorkspacePackage[], script: string) => {
  for (const p of packages) {
    const cmd = execa("pnpm", ["run", script, "--filter", p.name])
    cmd.stdout?.on("data", (data) => {
      console.log(chalk.cyan(chalk.bold(p.name)), data.toString())
    })
    cmd.stderr?.on("data", (data) => {
      console.log(chalk.cyan(chalk.bold(p.name)), data.toString())
    })
  }
}

async function main() {
  const packages = await getPackages()
  const { names } = await prompts([
    {
      name: "names",
      message: "Choose the packages to run dev script",
      type: "multiselect",
      choices: packages.map((p) => {
        return {
          title: p.name,
          value: p.name,
        }
      }),
    },
  ])
  runScripts(
    packages.filter((p) => names.includes(p.name)),
    "dev"
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
