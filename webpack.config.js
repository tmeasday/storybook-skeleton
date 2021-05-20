const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CpuProfilerWebpackPlugin = require("cpuprofile-webpack-plugin");
const { merge } = require("webpack-merge");

const project = process.env.PROJECT || "template";
const builder = process.env.BUILDER || "esbuild";

const builderAlternatives = {
  esbuild: {
    test: /\.([t|j]sx?|svg)$/,
    loader: "esbuild-loader",
    exclude: /node_modules/,
    options: {
      loader: "tsx",
      target: "es2015",
    },
  },
  swc: {
    test: /\.([t|j]sx?)$/,
    loader: "swc-loader",
    exclude: /node_modules/,
    options: {
      jsc: {
        parser: {
          syntax: "typescript",
        },
      },
    },
  },
  babel: {
    test: /\.([t|j]sx?)$/,
    loader: "babel-loader",
    exclude: /node_modules/,
    options: {
      presets: [
        ["@babel/preset-env", { targets: "defaults" }],
        "@babel/preset-typescript",
        "@babel/preset-react",
      ],
    },
  },
};

const projects = {
  chromatic: {
    module: {
      rules: [
        {
          test: /\.(m?[t|j]s)$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.svg$/,
          loader: "react-svg-loader",
          options: {
            jsx: true,
          },
        },
        {
          test: /\.(graphql|gql)$/,
          include: [/schema/],
          exclude: /node_modules/,
          loader: "raw-loader",
        },
        {
          test: /\.handlebars/,
          loader: "handlebars-loader",
          exclude: /node_modules/,
          // query: {
          //   helperDirs: path.join(__dirname, '..','lib', 'emails', 'helpers'),
          // },
        },
      ],
    },
  },
  "design-system": {
    module: {
      rules: [
        {
          test: /\.m?[t|j]sx?$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: "file-loader",
            },
          ],
        },
      ],
    },
  },
  template: {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
  },
};

const cpuProfiler = {
  plugins: [new CpuProfilerWebpackPlugin()],
};

module.exports = merge(
  {
    entry: `./src/${project}-entry.js`,
    mode: "development",
    watch: true,
    plugins: [new HtmlWebpackPlugin({ filename: "iframe.html" })],
    module: {
      rules: [builderAlternatives[builder]],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      alias: {
        react: path.resolve(__dirname, "node_modules/react"),
      },
      // Added this for Chromatic, perhaps we should generalise the config extension
      fallback: { path: require.resolve("path-browserify") },
    },
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
  },
  projects[project],
  // TODO: Parse truthy value better as this checks only for existence
  process.env.COMPILE_LAZILY
    ? {
        experiments: {
          lazyCompilation: true,
        },
      }
    : {},
  // TODO: Parse truthy value better as this checks only for existence
  process.env.PROFILE_CPU ? cpuProfiler : {}
);
