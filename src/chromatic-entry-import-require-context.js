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
  const [_, contextName] = name.split("/", 2);
  return contexts[contextName](name.replace(`./${contextName}`, "."));
};
