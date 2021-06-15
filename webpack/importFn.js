const path = require("path");

const context = ({ dir, filematch, importStyle }) => `
  require.context(
    "${path.resolve("./storybook", dir)}",
    true,
    /${filematch.replace(/\./g, "\\.").replace("*", ".*")}/
    ${importStyle === "lazy-require-context" ? ', "lazy"' : ""}
  )
`;

const contextImportFn = ({ stories, importStyle }) => {
  // XXX: Assumes all globs include a ** part
  const parts = [].concat(stories).map((s) => s.split("/**/"));

  return `
    const contexts = {
      ${parts
        .map(
          ([dir, filematch]) =>
            `['${dir}']: ${context({ dir, filematch, importStyle })}`
        )
        .join(",")}
    };

    const importFn = (path) => {
      return Object.entries(contexts).map(([prefix, context]) => {
        if (path.startsWith(prefix)) {
          return context(path.replace(prefix, '.'));
        }
      }).find(Boolean);
    }
  `;
};

const importFn = ({ stories, importStyle }) => {
  if (["require-context", "lazy-require-context"].includes(importStyle)) {
    return contextImportFn({ stories, importStyle });
  }
};

module.exports = { importFn };
