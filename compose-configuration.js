const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");
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

const developmentConfig = ({ project }) => ({
  entry: ["webpack-plugin-serve/client", `./src/${project}-entry.js`],
  mode: "development",
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
});

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
}) {
  let targetConfiguration;

  switch (target) {
    case "development":
      targetConfiguration = developmentConfig;
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
    enableFsCache ? { cache: { type: "filesystem" } } : {}
  );
}

module.exports = composeConfiguration;
