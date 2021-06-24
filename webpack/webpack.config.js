const argv = require("webpack-nano/argv");
const path = require("path");
const composeConfiguration = require("./compose-configuration");

const projectDir = process.cwd();
const configDir = path.resolve(projectDir, "./.storybook");

module.exports = composeConfiguration({
  projectDir,
  configDir,
  target: process.env.TARGET || argv.target || "development",
  importStyle: process.env.IMPORT || "require-context",
  vertical: process.env.VERTICAL === "1",
  builder: process.env.BUILDER || "none",
  compileLazily: process.env.COMPILE_LAZILY === "1",
  profileCpu: process.env.PROFILE_CPU === "1",
  enableSourceMaps: process.env.ENABLE_SOURCE_MAPS === "1",
  enableFsCache: process.env.ENABLE_FS_CACHE === "1",
  devServer: process.env.DEV_SERVER || "wds",
  enableCdn: process.env.ENABLE_CDN === "1",
  debug: process.env.DEBUG === "1",
});
