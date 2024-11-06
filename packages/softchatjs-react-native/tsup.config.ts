import { defineConfig } from "tsup"

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
  loader: {
    '.js': 'jsx',
  },
  external: ['softchatjs-core', 'react', 'react-dom'],
})