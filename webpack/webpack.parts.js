const path = require("path");
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
  const entry = `
  import { configure } from './skeleton/src/storybook';
  
  import * as globalConfig from './.storybook/preview';
  
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

// const projects = {
//   chromatic: {
//     module: {
//       rules: [
//         {
//           test: /\.(m?[t|j]s)$/,
//           resolve: {
//             fullySpecified: false,
//           },
//         },
//         {
//           test: /\.svg$/,
//           loader: "react-svg-loader",
//           options: {
//             jsx: true,
//           },
//         },
//         {
//           test: /\.(graphql|gql)$/,
//           include: [/schema/],
//           exclude: /node_modules/,
//           loader: "raw-loader",
//         },
//         {
//           test: /\.handlebars/,
//           loader: "handlebars-loader",
//           exclude: /node_modules/,
//           // query: {
//           //   helperDirs: path.join(__dirname, '..','lib', 'emails', 'helpers'),
//           // },
//         },
//       ],
//     },
//     resolve: {
//       fallback: { path: require.resolve("path-browserify") },
//     },
//   },
// };

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
