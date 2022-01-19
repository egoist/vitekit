// Some plugins use utilities from Vite
// So we re-export Vite here
// When bundling plugins, alias vite to vitekit/shared/vite.js
import * as vite from "vite"

export { vite as default }
export * from "vite"
