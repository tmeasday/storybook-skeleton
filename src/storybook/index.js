import { renderStory } from './renderStory';
import { composeStory } from './composeStory.ts';
import { loadStory } from './loadStory.ts';

export async function configure(context, storiesJson, globalConfig = {}) {
  async function renderStoryId(storyId) {
    const { story, meta } = await loadStory(context, storiesJson, storyId);

    const composed = composeStory(story, meta, globalConfig);

    renderStory(composed);
  }

  const params = new URLSearchParams(document.location.search);
  const storyId = params.get('id');

  if (storyId) return renderStoryId(storyId, globalConfig);
}
