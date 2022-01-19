import path from "upath"
import fs from "fs-extra"

import { ROUTE_EXTENSIONS } from "./routes"

const DOCUMENT_FILE_NAMES = ROUTE_EXTENSIONS.map((ext) => `document${ext}`)
const ROOT_FILE_NAMES = ROUTE_EXTENSIONS.map((ext) => `root${ext}`)
const ERROR_FILE_NAMES = ROUTE_EXTENSIONS.map((ext) => `error${ext}`)
const NOTFOUND_FILE_NAMES = ROUTE_EXTENSIONS.map((ext) => `404${ext}`)

export const writeSpecialFiles = async ({
  appDir,
  runtimeDir,
}: {
  appDir: string
  runtimeDir: string
}) => {
  const files = await fs.readdir(appDir)
  let documentFile: string | undefined
  let rootFile: string | undefined
  let errorFile: string | undefined
  let notFoundFile: string | undefined

  for (const file of files) {
    if (DOCUMENT_FILE_NAMES.includes(file)) {
      documentFile = file
    } else if (ROOT_FILE_NAMES.includes(file)) {
      rootFile = file
    } else if (ERROR_FILE_NAMES.includes(file)) {
      errorFile = file
    } else if (NOTFOUND_FILE_NAMES.includes(file)) {
      notFoundFile = file
    }
  }

  if (!documentFile) {
    throw new Error(
      `One of ${DOCUMENT_FILE_NAMES.join(
        ","
      )} is required in ${appDir} but not found`
    )
  }

  if (!errorFile) {
    throw new Error(
      `One of ${ERROR_FILE_NAMES.join(
        ","
      )} is required in ${appDir} but not found`
    )
  }

  if (!rootFile) {
    throw new Error(
      `One of ${ROOT_FILE_NAMES.join(
        ","
      )} is required in ${appDir} but not found`
    )
  }

  if (!notFoundFile) {
    throw new Error(
      `One of ${NOTFOUND_FILE_NAMES.join(
        ","
      )} is required in ${appDir} but not found`
    )
  }

  const content = `
  export let rootFile = () => import("${path.relative(
    runtimeDir,
    path.join(appDir, rootFile)
  )}")
  export let documentFile = () => import("${path.relative(
    runtimeDir,
    path.join(appDir, documentFile)
  )}")
  export let errorFile = () => import("${path.relative(
    runtimeDir,
    path.join(appDir, errorFile)
  )}")
  export let notFoundFile = () => import("${path.relative(
    runtimeDir,
    path.join(appDir, notFoundFile)
  )}")
  
  `

  await fs.outputFile(path.join(runtimeDir, "special-files.js"), content)
}
