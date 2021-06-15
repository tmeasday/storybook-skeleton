const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackCdnPlugin = require("webpack-cdn-plugin");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");

const commonConfig = {
  plugins: [new HtmlWebpackPlugin({ filename: "iframe.html" })],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    // alias: {
    //   react: path.resolve(__dirname, "node_modules/react"),
    // },
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};

async function composeConfiguration({
  storybookConfig,
  target,
  importStyle,
  vertical,
  builder,
  compileLazily,
  profileCpu,
  enableSourceMaps,
  enableFsCache,
  devServer,
  enableCdn,
}) {
  let targetConfiguration;

  switch (target) {
    case "development":
      targetConfiguration = { mode: "development" };
      break;
    case "production":
      targetConfiguration = {
        entry: parts.SKELETON_ENTRY,
        mode: "production",
      };
      break;
    default:
      throw new Error(`Unknown target: ${target}`);
  }

  let projectConfig;
  if (!storybookConfig.skeletonWebpackConfig) {
    throw new Error(
      `Didn't find \`skeletonWebpackConfig\` in \`.storybook/main.js\``
    );
  } else if (typeof storybookConfig.skeletonWebpackConfig === "function") {
    projectConfig = await storybookConfig.skeletonWebpackConfig();
  } else {
    projectConfig = storybookConfig.skeletonWebpackConfig;
  }

  const config = merge(
    commonConfig,
    projectConfig,
    await parts.entrypointsVirtualModules({
      stories: storybookConfig.stories,
      importStyle,
    }),
    targetConfiguration,
    parts[devServer],
    {
      module: {
        rules: [parts.builderAlternatives[builder]],
      },
    },
    compileLazily ? { experiments: { lazyCompilation: true } } : {},
    profileCpu ? parts.cpuProfiler() : {},
    enableSourceMaps ? { devtool: "cheap-module-source-map" } : {},
    enableFsCache ? { cache: { type: "filesystem" } } : {},
    vertical ? parts.splitVertically : {},
    enableCdn
      ? {
          externals: {
            lodash: "lodash",
            react: "React",
            "react-dom": "ReactDOM",
          },
          plugins: [
            new WebpackCdnPlugin({
              modules: [
                {
                  name: "lodash",
                  var: "_",
                  path: "lodash.min.js",
                },
                {
                  name: "react",
                  var: "React",
                  path: "umd/react.development.js",
                },
                {
                  name: "react-dom",
                  var: "ReactDOM",
                  path: "umd/react-dom.development.js",
                },
              ],
              publicPath: "/node_modules",
            }),
          ],
        }
      : {}
  );

  console.log(config);
  return config;
}

module.exports = composeConfiguration;
