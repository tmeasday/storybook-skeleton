const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const project = process.env.PROJECT || 'template';

module.exports = {
  entry: `./src/${project}-entry.js`,
  plugins: [new HtmlWebpackPlugin({ filename: 'iframe.html' })],
  module: {
    rules: [
      {
        test: /\.([t|j]sx?|svg)$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'tsx',
          target: 'es2015',
        },
      },
      ...require(`./webpack/${project}-loaders`).loaders,
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
    },
    // Added this for Chromatic, perhaps we should generalise the config extension
    fallback: { path: require.resolve('path-browserify') },
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
