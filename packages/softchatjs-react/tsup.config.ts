import { defineConfig } from "tsup"
import inlineCssPlugin from 'esbuild-plugin-inline-css';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'], 
  format: ["esm"],
  // format: ["cjs", "esm"],
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