// console.time, console.timeEnd
const webpack = require("webpack");
const { builderAlternatives } = require("../webpack.parts");
const composeConfiguration = require("../compose-configuration");

async function main() {
  const builds = [];

  Object.keys(builderAlternatives).forEach((builder) => {
    const productionConfiguration = composeConfiguration({
      target: "production",
      project: "design-system",
      builder,
      compileLazily: true,
      profileCpu: true,
    });

    builds.push(
      () =>
        new Promise((resolve, reject) => {
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

  await runInSeries(builds);
}

async function runInSeries(promises) {
  for (const promise of promises) {
    await promise();
  }
}

main();
