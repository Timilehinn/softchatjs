const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = [
  {
    // Configuration for CommonJS output (index.js)
    entry: './src/index.ts',  // Your entry TypeScript file
    output: {
      filename: 'index.js',  // Generates index.js (CommonJS)
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs2',  // CommonJS output for Node.js
      clean: true,  // Clean dist folder before build
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({})  // Resolve TypeScript path aliases
      ],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,  // Handle .ts and .tsx files
          use: 'ts-loader',  // Use ts-loader to transpile TypeScript files
          exclude: /node_modules/,
        },
      ],
    },
    devtool: 'source-map',  // Enable source maps for debugging
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,  // Enable parallel minification
        }),
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),  // Clean dist folder before each build
    ],
    externals: ['react', 'react-dom'],  // Exclude React from the bundle
  },
  {
    // Configuration for ES Module output (index.mjs)
    entry: './src/index.ts',
    output: {
      filename: 'index.mjs',  // Generates index.mjs (ES Module)
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'module',  // ES module output
      clean: true,  // Clean dist folder before build
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({})  // Resolve TypeScript path aliases
      ],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,  // Handle .ts and .tsx files
          use: 'ts-loader',  // Use ts-loader to transpile TypeScript files
          exclude: /node_modules/,
        },
      ],
    },
    devtool: 'source-map',  // Enable source maps for debugging
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,  // Enable parallel minification
        }),
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),  // Clean dist folder before each build
    ],
    externals: ['react', 'react-dom'],  // Exclude React from the bundle
  },
];
