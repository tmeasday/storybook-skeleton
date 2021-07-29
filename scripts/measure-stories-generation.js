const assert = require("assert");
const path = require("path");
const { extractStoriesJson } = require("../webpack/stories-json");

// Reference: https://blog.abelotech.com/posts/measure-execution-time-nodejs-javascript/
async function measure() {
  const start = new Date();
  const hrstart = process.hrtime();

  const configDir = path.join(process.cwd(), "design-system");
  const storiesJson = await extractStoriesJson({
    configDir,
    stories: "./src/**/*.stories.(jsx|tsx)",
  });

  const end = new Date() - start;
  const hrend = process.hrtime(hrstart);

  console.info("Execution time: %dms", end);
  console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);

  assert.strictEqual(Object.keys(storiesJson.stories).length > 0, true);
}

measure();
