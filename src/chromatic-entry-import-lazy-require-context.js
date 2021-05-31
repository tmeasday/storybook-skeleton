const contexts = [
  require.context(
    "../chromatic/services/webapp/components",
    true,
    /\.stories\.js$/,
    "lazy"
  ),
  require.context(
    "../chromatic/services/webapp/containers",
    true,
    /\.stories\.js$/,
    "lazy"
  ),
  require.context(
    "../chromatic/services/webapp/layouts",
    true,
    /\.stories\.js$/,
    "lazy"
  ),
  require.context(
    "../chromatic/services/webapp/screens",
    true,
    /\.stories\.js$/,
    "lazy"
  ),
];

export const importFn = (name) => {
  const [_, contextName, path] = name.split("/", 3);
  return contexts[contextName](`./${path}`);
};
