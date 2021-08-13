export const parameters = {
  options: {
    storySort: function sortStories(a, b) {
      return a[1].kind === b[1].kind
        ? 0
        : a[1].id.localeCompare(b[1].id, undefined, { numeric: true });
    },
  },
};
