import { toId } from '@storybook/csf';

export function loadCsfFile({ default: meta, ...storyExports }) {
  return {
    meta,
    ...Object.fromEntries(
      Object.entries(storyExports).map(([exportName, story]) => [
        toId(meta.title, exportName),
        story,
      ])
    ),
  };
}
