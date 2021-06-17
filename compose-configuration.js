const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackCdnPlugin = require("webpack-cdn-plugin");
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

const aliases = ({ project, importStyle }) => ({
  resolve: {
    alias: {
      [path.resolve(__dirname, `./src/${project}-entry-import`)]: path.resolve(
        __dirname,
        `./src/${project}-entry-import-${importStyle}`
      ),
    },
  },
});

function composeConfiguration({
  target,
  project,
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

  const config = merge(
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
    profileCpu ? parts.cpuProfiler() : {},
    enableSourceMaps ? { devtool: "cheap-module-source-map" } : {},
    enableFsCache ? { cache: { type: "filesystem" } } : {},
    parts[devServer]({ project }),
    aliases({ project, importStyle }),
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

  if (profileCpu) {
    const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
    const smp = new SpeedMeasurePlugin({
      // Experimental and not totally accurate
      granularLoaderData: true,
    });

    return smp.wrap(config);
  }

  return config;
}

module.exports = composeConfiguration;
