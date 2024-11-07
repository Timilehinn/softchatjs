import { defineConfig } from "tsup"
import inlineCssPlugin from 'esbuild-plugin-inline-css';
import { copyFile } from 'node:fs/promises'
import glob from 'tiny-glob'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const pexec = promisify(exec)

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'], 
  format: ["cjs", "esm"],
  sourcemap: true,
  target: "esnext",
  outDir: "dist",
  splitting: false,
  skipNodeModulesBundle: true,
  plugins: [inlineCssPlugin()],
  minify: true,
  loader: {
    '.js': 'jsx',
    '.css': 'copy',
    '.module.css': 'copy'
  },
  external: ['softchatjs-core'],
})