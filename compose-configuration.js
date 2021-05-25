const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");

const commonConfig = {
  plugins: [new HtmlWebpackPlugin({ filename: "iframe.html" })],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
    },
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};

const productionConfig = ({ project }) => ({
  entry: `./src/${project}-entry.js`,
  mode: "production",
});

function composeConfiguration({
  target,
  project,
  builder,
  compileLazily,
  profileCpu,
  enableSourceMaps,
  enableFsCache,
  devServer,
}) {
  let targetConfiguration;

  switch (target) {
    case "development":
      targetConfiguration = () => ({
        mode: "development",
      });
      break;
    case "production":
      targetConfiguration = productionConfig;
      break;
    default:
      throw new Error(`Unknown target: ${target}`);
  }

  return merge(
    commonConfig,
    {
      module: {
        rules: [parts.builderAlternatives[builder]],
      },
    },
    parts.projects[project],
    targetConfiguration({ project }),
    compileLazily
      ? {
          experiments: {
            lazyCompilation: true,
          },
        }
      : {},
    profileCpu ? parts.cpuProfiler : {},
    enableSourceMaps ? { devtool: "cheap-module-source-map" } : {},
    enableFsCache ? { cache: { type: "filesystem" } } : {},
    parts[devServer]({ project })
  );
}

module.exports = composeConfiguration;
