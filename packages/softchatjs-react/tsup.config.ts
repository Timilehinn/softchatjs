import { defineConfig } from "tsup"
import cssModulesPlugin from 'esbuild-css-modules-plugin'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'], 
  format: ["esm"],
  sourcemap: true,
  target: "esnext",
  outDir: "dist",
  splitting: false,
  skipNodeModulesBundle: true,
  plugins: [cssModulesPlugin({ inject: true })],
  minify: true,
  loader: {
    '.js': 'jsx',
    '.css': 'local-css'
  },
  external: ['softchatjs-core']
})