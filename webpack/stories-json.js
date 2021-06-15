// Lifted/adapted from @storybook/core-server/src/utils/stories-json.ts

const path = require("path");
const glob = require("globby");
const { readCsf } = require("@storybook/csf-tools");

// NOTE: assumes directory structure (skeleton/ sibling of .storybook/)
const configDir = path.join(process.cwd(), "./storybook");

async function extractStoriesJson({ stories: storiesGlobs }) {
  if (!storiesGlobs) {
    throw new Error("No stories glob");
  }
  const storyFiles = [];
  await Promise.all(
    [].concat(storiesGlobs).map(async (storiesGlob) => {
      const files = await glob(path.join(configDir, storiesGlob));
      storyFiles.push(...files);
    })
  );
  console.log(
    `⚙️ Processing ${storyFiles.length} story files from ${storiesGlobs}`
  );

  const stories = {};
  await Promise.all(
    storyFiles.map(async (absolutePath) => {
      const ext = path.extname(absolutePath);
      const relativePath = path.relative(configDir, absolutePath);
      if (![".js", ".jsx", ".ts", ".tsx"].includes(ext)) {
        console.log(`Skipping ${ext} file ${relativePath}`);
        return;
      }
      try {
        const csf = (await readCsf(absolutePath)).parse();
        csf.stories.forEach((story) => {
          stories[story.id] = {
            ...story,
            kind: csf.meta.title,
            parameters: { ...story.parameters, fileName: relativePath },
          };
        });
      } catch (err) {
        console.warn(`🚨 Extraction error on ${relativePath}`);
        throw err;
      }
    })
  );

  return { v: 3, stories };
}

module.exports = { extractStoriesJson };
