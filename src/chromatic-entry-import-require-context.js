const contexts = {
  components: require.context(
    "../chromatic/services/webapp/components",
    true,
    /\.stories\.js$/
  ),
  containers: require.context(
    "../chromatic/services/webapp/containers",
    true,
    /\.stories\.js$/
  ),
  layouts: require.context(
    "../chromatic/services/webapp/layouts",
    true,
    /\.stories\.js$/
  ),
  screens: require.context(
    "../chromatic/services/webapp/screens",
    true,
    /\.stories\.js$/
  ),
};

export const importFn = (name) => {
  const [_, contextName, path] = name.split("/", 3);
  return contexts[contextName](`./${path}`);
};
