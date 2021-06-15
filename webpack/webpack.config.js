const argv = require("webpack-nano/argv");
const path = require("path");
const composeConfiguration = require("./compose-configuration");

// NOTE: assumes directory structure (skeleton/ sibiling of .storybook/)
const storybookConfig = require(path.resolve(
  process.cwd(),
  "./.storybook/main.js"
));

module.exports = composeConfiguration({
  storybookConfig,
  target: process.env.TARGET || argv.target || "development",
  importStyle: process.env.IMPORT || "require-context",
  vertical: process.env.VERTICAL === "1",
  builder: process.env.BUILDER || "esbuild",
  compileLazily: process.env.COMPILE_LAZILY === "1",
  profileCpu: process.env.PROFILE_CPU === "1",
  enableSourceMaps: process.env.ENABLE_SOURCE_MAPS === "1",
  enableFsCache: process.env.ENABLE_FS_CACHE === "1",
  devServer: process.env.DEV_SERVER || "wds",
  enableCdn: process.env.ENABLE_CDN === "1",
});
