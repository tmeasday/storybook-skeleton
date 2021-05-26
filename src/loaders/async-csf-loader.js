const { basename } = require("path");

module.exports = function (source) {
  // Extremely hacky loader to do a "async CSF" transform via regexp

  // 1. Remove `import MyComponent from './MyComponent.jsx';`,
  // assuming that "MyComponent" is the name of this file (without the `.stories`)

  // Looks like `./path/to/MyComponent.stories.jsx`
  const storyRequest = this._module.rawRequest;
  // Looks like `./MyComponent`
  const componentRequest = `./${basename(storyRequest).replace(
    /\.stories\.m?(t|j)sx?$/,
    ""
  )}`;
  // Looks like `import MyComponent, { MyComponentPure } from './MyComponent.jsx';`
  const componentImportRegex = new RegExp(
    `import ([^{},;]+)?,?\s*(\{[^{}]+\})? from ['"]${componentRequest}['"];`,
    "ms"
  );
  // Looks like `MyComponent` or `{ MyComponent }`
  const componentImportSymbolMap = {}; // what it is referred to => what it is exported as
  const match = source.match(componentImportRegex);
  if (!match || (!match[1] && !match[2])) {
    console.error(`Failed to find '${componentRequest}' in '${storyRequest}'`);
    return source;
  }
  if (match[1]) {
    componentImportSymbolMap[match[1]] = "default";
  }
  if (match[2]) {
    // looks like { foo as bar,\n bing,\n }
    match[2]
      .replace(/[\s{}]/gs, "")
      .split(",")
      .forEach((part) => {
        if (!part) return;

        const [exportName, symbolName] = part.split("as");
        componentImportSymbolMap[symbolName || exportName] = exportName;
      });
  }

  let newSource = source.replace(componentImportRegex, "");

  // 2. Remove `component: ...,` completely
  newSource = newSource.replace(/component: .*,/, "");

  // 3. Insert a cheeky little component proxy (so we don't need to put the component name in a up-cased var)
  newSource =
    newSource +
    "\n;const AsyncLoaderProxy = ({ AsyncLoaderComponent, ...props }) => <AsyncLoaderComponent {...props} />;";

  // symbolName is e.g. `MyComponentRenamed`, exportName is e.g. `MyComponent`
  Object.entries(componentImportSymbolMap).forEach(
    ([symbolName, exportName]) => {
      // 4. Replace all instances of `<MyComponentRenamed` (assumed to be in story functions)
      // with `<AsyncLoaderProxy AsyncLoaderComponent={arguments[1].loaded.MyComponent}`.
      newSource = newSource.replace(
        new RegExp(`<${symbolName}`, "g"),
        `<AsyncLoaderProxy AsyncLoaderComponent={context.loaded.${exportName}}`
      );

      // 5. Replace all instances of `</MyComponentRenamed` (assumed to be in story functions)
      // with `</AsyncLoaderProxy`.
      newSource = newSource.replace(
        new RegExp(`</${symbolName}`, "g"),
        `</AsyncLoaderProxy`
      );
    }
  );

  // 6. Replace all '() =>' or '(args) => with '(args, context) =>'
  newSource = newSource.replace(
    new RegExp(/\((args)?\) =>/, "g"),
    "(args, context) =>"
  );

  // 7. Add `loaders: [() => import('./MyComponent')],` to the default export
  const loadersLine = `loaders: [() => import('${componentRequest}')],`;
  newSource = newSource.replace(
    "export default {",
    `export default {\n  ${loadersLine}`
  );

  console.log({
    storyRequest,
    componentRequest,
    componentImportSymbolMap,
    loadersLine,
  });

  // console.log(newSource);

  return newSource;
};
