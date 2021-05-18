import { loadCsfFile } from './loadCsfFile';

export async function loadStory(context, storiesJson, storyId) {
  const storyData = storiesJson.stories[storyId];

  if (!storyData) {
    throw new Error(`Didn't find story with id ${storyId}`);
  }
  console.debug(storyData);

  const exports = await context(storyData.parameters.fileName);
  console.debug(exports);
  const stories = loadCsfFile(exports);
  console.debug(stories);

  const story = stories[storyId];

  if (!story) {
    throw new Error(`Didn't find a story matching storyId: ${storyId}
  
  storyIds: ${Object.keys(stories).join(',')}`);
  }

  return { story, meta: exports.default };
}
