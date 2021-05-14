// Taken from https://github.com/storybookjs/testing-react/blob/main/src/index.ts
// Thanks @yannbf!

import { defaultDecorateStory } from './decorateStory.ts';
import { combineParameters } from './parameters.ts';

import type { GlobalConfig, Meta, Story, StoryContext } from './types';

let globalStorybookConfig = {};

/** Function that sets the globalConfig of your storybook. The global config is the preview module of your .storybook folder.
 *
 * It should be run a single time, so that your global config (e.g. decorators) is applied to your stories when using `composeStories` or `composeStory`.
 *
 * Example:
 *```jsx
 * // setup.js (for jest)
 * import { setGlobalConfig } from '@storybook/testing-react';
 * import * as globalStorybookConfig from './.storybook/preview';
 *
 * setGlobalConfig(globalStorybookConfig);
 *```
 *
 * @param config - e.g. (import * as globalConfig from '../.storybook/preview')
 */
export function setGlobalConfig(config: GlobalConfig) {
  globalStorybookConfig = config;
}

/**
 * Function that will receive a story along with meta (e.g. a default export from a .stories file)
 * and optionally a globalConfig e.g. (import * from '../.storybook/preview)
 * and will return a composed component that has all args/parameters/decorators/etc combined and applied to it.
 *
 *
 * It's very useful for reusing a story in scenarios outside of Storybook like unit testing.
 *
 * Example:
 *```jsx
 * import { render } from '@testing-library/react';
 * import { composeStory } from '@storybook/testing-react';
 * import Meta, { Primary as PrimaryStory } from './Button.stories';
 *
 * const Primary = composeStory(PrimaryStory, Meta);
 *
 * test('renders primary button with Hello World', () => {
 *   const { getByText } = render(<Primary>Hello world</Primary>);
 *   expect(getByText(/Hello world/i)).not.toBeNull();
 * });
 *```
 *
 * @param story
 * @param meta - e.g. (import Meta from './Button.stories')
 * @param [globalConfig] - e.g. (import * as globalConfig from '../.storybook/preview') this can be applied automatically if you use `setGlobalConfig` in your setup files.
 */
export function composeStory<GenericArgs>(
  story: Story<GenericArgs>,
  meta: Meta<GenericArgs>,
  globalConfig: GlobalConfig = globalStorybookConfig
) {
  if (typeof story !== 'function') {
    throw new Error(
      `Cannot compose story due to invalid format. @storybook/testing-react expected a function but received ${typeof story} instead.`
    );
  }

  const finalStoryFn = (context: StoryContext) => {
    const { passArgsFirst = true } = context.parameters;
    if (!passArgsFirst) {
      throw new Error(
        'composeStory does not support legacy style stories (with passArgsFirst = false).'
      );
    }
    return story(context.args as GenericArgs, context);
  };

  const combinedDecorators = [
    ...(story?.story.decorators || story.decorators || []),
    ...(meta?.decorators || []),
    ...(globalConfig?.decorators || []),
  ];

  const decorated = defaultDecorateStory(finalStoryFn as any, combinedDecorators as any);

  const defaultGlobals = Object.entries(
    (globalConfig.globalTypes || {}) as Record<string, { defaultValue: any }>
  ).reduce((acc, [arg, { defaultValue }]) => {
    if (defaultValue) {
      acc[arg] = defaultValue;
    }
    return acc;
  }, {} as Record<string, { defaultValue: any }>);

  return ((extraArgs: Record<string, any>) =>
    decorated({
      id: '',
      kind: '',
      name: '',
      argTypes: globalConfig.argTypes || {},
      globals: defaultGlobals,
      parameters: combineParameters(
        globalConfig.parameters || {},
        meta.parameters || {},
        story.story?.parameters || story.parameters || {}
      ),
      args: {
        ...meta.args,
        ...(story.story?.args || story.args),
        ...extraArgs,
      },
    })) as Story<Partial<GenericArgs>>;
}
