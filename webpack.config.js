const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");
const { merge } = require("webpack-merge");
const { target } = require("webpack-nano/argv");
const parts = require("./webpack.parts");

const project = process.env.PROJECT || "template";
const builder = process.env.BUILDER || "esbuild";

const commonConfig = merge(
  {
    plugins: [new HtmlWebpackPlugin({ filename: "iframe.html" })],
    module: {
      rules: [parts.builderAlternatives[builder]],
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
  parts.projects[project],
  process.env.COMPILE_LAZILY === "1"
    ? {
        experiments: {
          lazyCompilation: true,
        },
      }
    : {},
  process.env.PROFILE_CPU === "1" ? parts.cpuProfiler : {}
);

const developmentConfig = {
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
};

const productionConfig = {
  entry: `./src/${project}-entry.js`,
  mode: "production",
};

switch (target) {
  case "development":
    module.exports = merge(commonConfig, developmentConfig);
    break;
  case "production":
    module.exports = merge(commonConfig, productionConfig);
    break;

  default:
    throw new Error(`Unknown target: ${target}`);
}
