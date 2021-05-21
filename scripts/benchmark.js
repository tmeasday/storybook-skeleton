// console.time, console.timeEnd
const webpack = require("webpack");
const { builderAlternatives } = require("../webpack.parts");
const composeConfiguration = require("../compose-configuration");

async function main() {
  const builds = [];

  Object.keys(builderAlternatives).forEach((builder) => {
    [true, false].forEach((enableSourceMaps) => {
      const productionConfiguration = composeConfiguration({
        target: "production",
        project: "design-system",
        builder,
        compileLazily: true,
        profileCpu: true,
        enableSourceMaps,
      });

      builds.push(
        () =>
          new Promise((resolve, reject) => {
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

  await runInSeries(builds);
}

async function runInSeries(promises) {
  for (const promise of promises) {
    await promise();
  }
}

main();
