module.exports = function (source) {
  // Extremely hacky loader to do a "async CSF" transform via regexp

  // 1. Remove `import MyComponent from './MyComponent.jsx';`,
  // assuming that "MyComponent" is the name of this file (without the `.stories`)

  // Looks like `./MyComponent.stories.jsx`
  const storyRequest = this._module.rawRequest;
  // Looks like `./MyComponent`
  const componentRequest = storyRequest.replace(/\.stories\.m?(t|j)sx?$/, "");
  // Looks like `import MyComponent from './MyComponent.jsx';`
  const componentImportRegex = new RegExp(
    `import (.+) from ['"]${componentRequest}['"];`
  );
  // Looks like `MyComponent` or `{ MyComponent }`
  const componentImportSymbol = source.match(componentImportRegex)[1];
  let newSource = source.replace(componentImportRegex, "");

  // Looks like `MyComponent`
  const componentName = componentImportSymbol
    .replace("{ ", "")
    .replace(" }", "");
  const componentIsDefaultExport = componentName === componentImportSymbol;

  // 2. Remove `component: MyComponent,` completely
  newSource = newSource.replace(`component: ${componentName},`, "");

  // 3. Insert a cheeky little component proxy (so we don't need to put the component name in a up-cased var)
  newSource =
    newSource +
    "\n;const AsyncLoaderProxy = ({ AsyncLoaderComponent, ...props }) => <AsyncLoaderComponent {...props} />;";

  // 4. Replace all (other) instances of `MyComponent` (assumed to be in story functions)
  // with `AsyncLoaderProxy AsyncLoaderComponent={arguments[1].loaded.MyComponent}`.
  // (Except for title: ..)
  newSource = newSource.replace(
    new RegExp(`(?<!title:.*)${componentName}`, "g"),
    `AsyncLoaderProxy AsyncLoaderComponent={context.loaded.${componentName}}`
  );

  // 5. Replace all '() =>' or '(args) => with '(args, context) =>'
  newSource = newSource.replace(
    new RegExp(/\((args)?\) =>/, "g"),
    "(args, context) =>"
  );

  // 6. Add `loaders: [async () => ({ MyComponent: (await import('./MyComponent')).MyComponent })],`
  //    or `loaders: [async () => ({ MyComponent: (await import('./MyComponent')).default })],`
  // to the default export
  const loadersLine = `loaders: [async () => ({ ${componentName}: (await import('${componentRequest}')).${
    componentIsDefaultExport ? "default" : componentName
  } })],`;
  newSource = newSource.replace(
    "export default {",
    `export default { ${loadersLine}`
  );

  // console.log({
  //   storyRequest,
  //   componentRequest,
  //   componentName,
  //   componentIsDefaultExport,
  //   loadersLine,
  // });

  // console.log(newSource);

  return newSource;
};
