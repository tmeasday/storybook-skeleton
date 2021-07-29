const assert = require("assert");
const path = require("path");
const { extractStoriesJson } = require("../webpack/stories-json");
const { measure } = require("../src/measure");

measure(async () => {
  const configDir = path.join(process.cwd(), "design-system");
  const storiesJson = await extractStoriesJson({
    configDir,
    stories: "./src/**/*.stories.(jsx|tsx)",
  });

  assert.strictEqual(Object.keys(storiesJson.stories).length > 0, true);
});
