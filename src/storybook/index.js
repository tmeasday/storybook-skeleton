import { renderStory } from "./renderStory";
import { composeStory } from "./composeStory.ts";
import { loadStory } from "./loadStory.ts";
import { setupChannel } from "./setupChannel";

async function renderStoryId(importFn, storiesJson, globalConfig, storyId) {
  const { story, meta } = await loadStory(importFn, storiesJson, storyId);

  const composed = composeStory(story, meta, globalConfig);

  await renderStory(composed);
}

export async function configure(importFn, storiesJson, globalConfig = {}) {
  const { send } = setupChannel({
    onSetCurrentStory: (storyId) =>
      renderStoryId(importFn, storiesJson, globalConfig, storyId),
  });

  const params = new URLSearchParams(document.location.search);
  const storyId = params.get("id");

  send({
    type: "setStories",
    args: [
      {
        ...storiesJson,
        globals: {},
        globalParameters: {},
        kindParameters: {},
      },
    ],
  });

  if (storyId)
    await renderStoryId(importFn, storiesJson, globalConfig, storyId);
}
