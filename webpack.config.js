const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  plugins: [new HtmlWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.(m?[t|j]s)$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.([t|j]s|svg)$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'tsx',
          target: 'es2015',
        },
      },
      {
        test: /\.svg$/,
        loader: 'react-svg-loader',
        options: {
          jsx: true,
        },
      },
      {
        test: /\.(graphql|gql)$/,
        include: [/schema/],
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
    ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
