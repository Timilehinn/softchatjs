import { defineConfig } from "tsup"
import cssModulesPlugin from 'esbuild-css-modules-plugin'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'], 
  format: ["esm"],
  sourcemap: false,
  minify: false,
  target: "esnext",
  outDir: "dist",
  skipNodeModulesBundle: true,
  plugins: [cssModulesPlugin({ inject: true })],
  loader: {
    '.js': 'jsx',
    '.css': 'local-css'
  },
  external: ['softchatjs-core']
})