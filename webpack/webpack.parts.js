const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { WebpackPluginServe } = require("webpack-plugin-serve");
const VirtualModulesPlugin = require("webpack-virtual-modules");
const { extractStoriesJson } = require("./stories-json");
const { importFn } = require("./importFn");

const SKELETON_ENTRY = "./skeleton-entry.js";

const entrypointsVirtualModules = async ({
  stories,
  importStyle,
  configDir,
  projectDir,
}) => {
  const storiesJson = await extractStoriesJson({ stories, configDir });
  const previewPath = "./.storybook/preview";
  const existsSync = promisify(fs.exists);
  const hasPreview = (
    await Promise.all([
      existsSync(path.resolve(projectDir, `${previewPath}.js`)),
      existsSync(path.resolve(projectDir, `${previewPath}.ts`)),
    ])
  ).find(Boolean);
  const entry = `
  import { configure } from './skeleton/src/storybook';
  
  const globalConfig = ${hasPreview ? `require('./.storybook/preview')` : "{}"};
  
  const storiesJson = ${JSON.stringify(storiesJson)};
  
  ${importFn({ stories, importStyle, storiesJson, configDir, projectDir })};
  
  configure(importFn, storiesJson, globalConfig);`;
  console.log(entry);

  return {
    plugins: [
      new VirtualModulesPlugin({
        [path.join(projectDir, SKELETON_ENTRY)]: entry,
      }),
    ],
  };
};

const builderAlternatives = {
  esbuild: {
    test: /\.[t|j]sx?$/,
    loader: "esbuild-loader",
    exclude: /node_modules/,
    options: {
      loader: "tsx",
      target: "chrome90",
    },
  },
  swc: {
    test: /\.[t|j]sx?$/,
    loader: "swc-loader",
    exclude: /node_modules/,
    options: {
      env: {
        target: { chrome: "90" },
      },
      jsc: {
        parser: {
          syntax: "typescript",
          tsx: true,
        },
        transform: {
          react: {
            pragma: "React.createElement",
            pragmaFrag: "React.Fragment",
            throwIfNamespace: true,
            development: false,
            useBuiltins: false,
          },
        },
      },
    },
  },
  babel: {
    test: /\.[t|j]sx?$/,
    loader: "babel-loader",
    exclude: /node_modules/,
    options: {
      presets: [
        ["@babel/preset-env", { targets: { chrome: "90" } }],
        "@babel/preset-typescript",
        "@babel/preset-react",
      ],
    },
  },
  none: {},
};

const wps = {
  entry: ["webpack-plugin-serve/client", SKELETON_ENTRY],
  watch: true,
  plugins: [
    new WebpackPluginServe({
      port: 5000,
      static: "./dist",
      liveReload: true,
      waitForBuild: true,
      middleware: (app) =>
        app.use(async (ctx, next) => {
          await next();
          ctx.set("Access-Control-Allow-Headers", "*");
          ctx.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          ctx.set("Access-Control-Allow-Origin", "*");
        }),
    }),
  ],
};

const wds = {
  devServer: {
    port: 5000,
    contentBase: __dirname,
    hot: true,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
    },
  },
};

const cpuProfiler = () => {
  const CpuProfilerWebpackPlugin = require("cpuprofile-webpack-plugin");
  return {
    plugins: [new CpuProfilerWebpackPlugin()],
  };
};

const splitVertically = {
  module: {
    rules: [
      {
        test: /\.stories\.m?[t|j]sx?$/,
        loader: path.resolve("src/loaders/async-csf-loader"),
        exclude: /node_modules/,
      },
    ],
  },
};

module.exports = {
  SKELETON_ENTRY,
  entrypointsVirtualModules,
  builderAlternatives,
  cpuProfiler,
  wps,
  wds,
  splitVertically,
};
