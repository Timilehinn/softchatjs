import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'], 
  // format: ["esm"],
  format: ["esm", "cjs"],
  sourcemap: true,
  minify: false,
  target: "esnext",
  splitting: false,
  outDir: "dist",
  skipNodeModulesBundle: true,
  loader: {
    '.js': 'jsx',
  },
  external: ['softchatjs-core'],
})

