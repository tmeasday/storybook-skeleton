import { renderStory } from './renderStory';
import { composeStory } from './composeStory.ts';
import { loadStory } from './loadStory.ts';
import { setupChannel } from './setupChannel';

export async function configure(context, storiesJson, globalConfig = {}) {
  const { send } = setupChannel({ onSetCurrentStory: (storyId) => renderStoryId(storyId) });

  async function renderStoryId(storyId) {
    const { story, meta } = await loadStory(context, storiesJson, storyId);

    const composed = composeStory(story, meta, globalConfig);

    await renderStory(composed);
  }

  const params = new URLSearchParams(document.location.search);
  const storyId = params.get('id');

  if (storyId) await renderStoryId(storyId);

  send({
    type: 'setStories',
    args: [
      {
        ...storiesJson,
        globals: {},
        globalParameters: {},
        kindParameters: {},
      },
    ],
  });
}
