// console.time, console.timeEnd
const webpack = require("webpack");
const rimraf = require("rimraf");
const { builderAlternatives } = require("../webpack.parts");
const composeConfiguration = require("../compose-configuration");

async function main() {
  const builds = [];

  Object.keys(builderAlternatives).forEach((builder) => {
    [false, true].forEach((enableFsCache) => {
      [true, false].forEach((enableSourceMaps) => {
        [true, false].forEach((compileLazily) => {
          const productionConfiguration = composeConfiguration({
            target: "production",
            project: "design-system",
            builder,
            compileLazily,
            profileCpu: true,
            enableSourceMaps,
            enableFsCache,
          });

          builds.push(
            () =>
              new Promise((resolve, reject) => {
                console.log("---");
                console.log(
                  enableFsCache
                    ? "Compiling with FS cache"
                    : "Compiling without FS cache"
                );
                console.log(
                  compileLazily ? "Compiling lazily" : "Not compiling lazily"
                );
                console.log(
                  `Source maps ${enableSourceMaps ? "enabled" : "disabled"}`
                );
                console.time(builder);
                webpack(productionConfiguration, (err, stats) => {
                  if (err) {
                    return reject(err);
                  }

                  if (stats.hasErrors()) {
                    return reject(stats.toString("errors-only"));
                  }

                  console.timeEnd(builder);
                  resolve();
                });
              })
          );
        });
      });
    });
  });

  rimraf("node_modules/.cache/webpack", async (err) => {
    if (err) {
      return console.error(err);
    }

    await runInSeries(builds);
  });
}

async function runInSeries(promises) {
  for (const promise of promises) {
    await promise();
  }
}

main();
