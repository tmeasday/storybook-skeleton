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

const context = ({ input, importStyle, configDir }) => {
  const { path: dir, match } = toRequireContext(input);
  return `
    require.context(
      "${path.resolve(configDir, dir)}",
      true,
      /${match}/
      ${importStyle === "lazy-require-context" ? ', "lazy"' : ""}
    )
  `;
};

const contextImportFn = ({ stories: inputStories, importStyle, configDir }) => {
  // XXX: Assumes all globs include a ** part
  const stories = [].concat(inputStories);
  const parts = stories.map((s) => s.split("/**/"));

  return `
    const contexts = {
      ${parts
        .map(
          ([dir], index) =>
            `['${dir}']: ${context({
              input: stories[index],
              importStyle,
              configDir,
            })}`
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

const staticImportFn = ({
  storiesJson,
  importStyle,
  configDir,
  projectDir,
}) => {
  const pathMap = Object.fromEntries(
    Object.values(storiesJson.stories).map((story) => [
      story.parameters.fileName,
      // fileName is relative to .storybook, webpack wants it relative to project
      `./${path.relative(
        projectDir,
        path.resolve(configDir, story.parameters.fileName)
      )}`,
    ])
  );

  if (importStyle === "lazy-static") {
    return `
      const imports = {
        ${Object.entries(pathMap)
          .map(([sbPath, wpPath]) => `["${sbPath}"]: () => import("${wpPath}")`)
          .join(",\n")}
      };

      const importFn = (path) => imports[path]();
    `;
  }

  return `
    const imports = {
      ${Object.entries(pathMap)
        .map(([sbPath, wpPath]) => `["${sbPath}"]: require("${wpPath}")`)
        .join(",\n")}
    };

    const importFn = (path) => imports[path];
  `;
};

const dynamicImportFn = ({ stories: inputStories, importStyle, configDir }) => {
  // XXX: Assumes all globs include a ** part, and end in a fixed extension
  const stories = [].concat(inputStories);
  const parts = stories.map((s) => s.split("/**/"));

  const importFnName = importStyle === "lazy-dynamic" ? "import" : "require";
  // Take a part above, e.g. ['./components', '*.stories.ts'],
  // and make a function that:
  //   - takes a suffix (e.g. 'Button/MiddleButton.stories.ts')
  //   - strips the .stories.ts part => middle (to 'Button/MiddleButton')
  //   - runs import(`./components/${middle}.stories.ts`)
  const makeImportFnPart = ([prefix, fileMatch]) => {
    const pathPrefix = path.resolve(configDir, prefix);
    const fileSuffix = fileMatch.replace("*", "");
    return `
      (suffix) => {
        const middle = suffix.substring(0, suffix.length - ${fileSuffix.length});
        return ${importFnName}(\`${pathPrefix}/\${middle}${fileSuffix}\`);
      }
    `;
  };

  return `
    const importFnParts = {
      ${parts
        .map((part) => `['${part[0]}']: ${makeImportFnPart(part)}`)
        .join(",")}
    };

    const importFn = (path) => {
      return Object.entries(importFnParts).map(([prefix, importFnPart]) => {
        if (path.startsWith(prefix)) {
          return importFnPart(path.replace(\`\${prefix}/\`, ''));
        }
      }).find(Boolean);
    }
  `;
};

const importFn = ({
  stories,
  importStyle,
  storiesJson,
  configDir,
  projectDir,
}) => {
  if (["require-context", "lazy-require-context"].includes(importStyle)) {
    return contextImportFn({ stories, importStyle, configDir });
  }

  if (["static", "lazy-static"].includes(importStyle)) {
    return staticImportFn({ storiesJson, importStyle, configDir, projectDir });
  }

  if (["dynamic", "lazy-dynamic"].includes(importStyle)) {
    return dynamicImportFn({ stories, importStyle, configDir });
  }
};

module.exports = { importFn };
