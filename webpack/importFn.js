const path = require("path");
const { makeRe } = require("micromatch");
const globBase = require("glob-base");

// Adapted from @storybook/core-common/src/utils/to-require-context.ts
const toRequireContext = (input) => {
  const { base, glob } = globBase(input);
  const recursive = glob.includes("**") || glob.split("/").length > 1;
  const regex = makeRe(glob, {
    fastpaths: false,
    noglobstar: false,
    bash: false,
  });
  const { source } = regex;
  if (source.startsWith("^")) {
    // webpack's require.context matches against paths starting `./`
    // Globs starting `**` require special treatment due to the regex they
    // produce, specifically a negative look-ahead
    const match = [
      "^\\.",
      glob.startsWith("**") ? "" : "\\/",
      source.substring(1),
    ].join("");
    return { path: base, recursive, match };
  }
  throw new Error(`Invalid glob: >> ${input} >> ${regex}`);
};

const context = ({ input, importStyle }) => {
  const { path: dir, recursive, match } = toRequireContext(input);
  return `
    require.context(
      "${path.resolve("./storybook", dir)}",
      true,
      /${match}/
      ${importStyle === "lazy-require-context" ? ', "lazy"' : ""}
    )
  `;
};

const contextImportFn = ({ stories, importStyle }) => {
  // XXX: Assumes all globs include a ** part
  const parts = [].concat(stories).map((s) => s.split("/**/"));

  return `
    const contexts = {
      ${parts
        .map(
          ([dir], index) =>
            `['${dir}']: ${context({ input: stories[index], importStyle })}`
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
