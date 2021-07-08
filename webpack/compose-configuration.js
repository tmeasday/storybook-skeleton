const path = require("path");
const WebpackCdnPlugin = require("webpack-cdn-plugin");
const { merge } = require("webpack-merge");
const parts = require("./webpack.parts");

async function composeConfiguration({
  projectDir,
  configDir,
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
  debug,
}) {
  const commonConfig = {
    mode: target,
    entry: parts.SKELETON_ENTRY,
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      alias: {
        react: path.resolve(projectDir, "node_modules/react"),
        ["react-dom"]: path.resolve(projectDir, "node_modules/react-dom"),
      },
    },
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
  };

  const { skeletonWebpackConfig, stories } = require(path.resolve(
    configDir,
    "main.js"
  ));
  let projectConfig;
  if (!skeletonWebpackConfig) {
    projectConfig = {};
  } else if (typeof skeletonWebpackConfig === "function") {
    try {
      projectConfig = await skeletonWebpackConfig();
    } catch (err) {
      console.error(`Unable to evaluate \`skeletonWebpackConfig\`\n`);
      throw err;
    }
  } else {
    projectConfig = skeletonWebpackConfig;
  }

  const config = merge(
    commonConfig,
    projectConfig,
    await parts.entrypointsVirtualModules({
      stories,
      importStyle,
      configDir,
      projectDir,
      debug,
    }),
    parts[devServer]({ stories, configDir, projectDir }),
    { module: { rules: [parts.builderAlternatives[builder]] } },
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

  if (debug) console.log(`\nWEBPACK CONFIG\n\n`, config);
  return config;
}

module.exports = composeConfiguration;
