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
  debug,
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

  if (debug) console.log(`\nVIRTUAL MODULE ENTRY\n`, entry);
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

const wps = ({ stories, configDir, projectDir }) => ({
  entry: ["webpack-plugin-serve/client", SKELETON_ENTRY],
  watch: true,
  plugins: [
    new WebpackPluginServe({
      port: 5000,
      static: "./dist",
      liveReload: true,
      waitForBuild: true,
      middleware: async (app) => {
        const storiesJson = await extractStoriesJson({ stories, configDir });

        app.use(async (ctx, next) => {
          await next();
          ctx.set("Access-Control-Allow-Headers", "*");
          ctx.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          ctx.set("Access-Control-Allow-Origin", "*");
        });

        addSideloadingAPI(app, storiesJson);
        setupFileWatcher(projectDir);
      },
    }),
  ],
});

const wds = ({ stories, configDir, projectDir }) => ({
  devServer: {
    port: 5000,
    contentBase: __dirname,
    hot: true,
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Origin": "*",
    },
    after: async (app) => {
      const storiesJson = await extractStoriesJson({ stories, configDir });

      addSideloadingAPI(app, storiesJson);
      setupFileWatcher(projectDir);
    },
  },
});

// TODO: Handle updates (i.e. if something in glob changes).
// Is there a hook for wds/wps for that?
function addSideloadingAPI(app, storiesJson, projectDir) {
  app.get("/api/ping", (_, res) => res.send("pong"));
  app.get("/api/stories.json", (_, res) => res.json(storiesJson));
  app.get("/api/stories/:id.json", ({ params: { id } }, res) => {
    if (id) {
      if (storiesJson.stories[id]) {
        return res.json(storiesJson.stories[id]);
      }

      return res.sendStatus(404);
    }

    res.sendStatus(400);
  });
}

// TODO: Connect the events with a websocket server
function setupFileWatcher(projectDir) {
  const Watchpack = require("watchpack");

  // See https://www.npmjs.com/package/watchpack for full options.
  // If you want less traffic, consider using aggregation with some interval
  const wp = new Watchpack({
    poll: true,
    // Slower but the assumption is that some people use symlinks
    followSymlinks: true,
    ignored: "**/.git",
  });

  wp.watch({
    directories: [projectDir],
  });

  wp.on("change", (filePath, mtime, explanation) => {
    // filePath: the changed file
    // mtime: last modified time for the changed file
    // explanation: textual information how this change was detected
    console.log("changed", { filePath, mtime, explanation });
  });

  wp.on("remove", (filePath, explanation) => {
    // filePath: the removed file or directory
    // explanation: textual information how this change was detected
    console.log("removed", { filePath, explanation });
  });

  // TODO: This probably should get called when the server is being shut down
  // wp.close();
}

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
