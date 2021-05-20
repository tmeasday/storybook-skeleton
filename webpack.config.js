const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CpuProfilerWebpackPlugin = require("cpuprofile-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");
const { merge } = require("webpack-merge");
const { target } = require("webpack-nano/argv");

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

const commonConfig = merge(
  {
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
  process.env.COMPILE_LAZILY === "1"
    ? {
        experiments: {
          lazyCompilation: true,
        },
      }
    : {},
  process.env.PROFILE_CPU === "1" ? cpuProfiler : {}
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
