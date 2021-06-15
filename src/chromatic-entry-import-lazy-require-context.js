const contexts = {
  components: require.context(
    "../chromatic/services/webapp/components",
    true,
    /\.stories\.js$/,
    "lazy"
  ),
  containers: require.context(
    "../chromatic/services/webapp/containers",
    true,
    /\.stories\.js$/,
    "lazy"
  ),
  layouts: require.context(
    "../chromatic/services/webapp/layouts",
    true,
    /\.stories\.js$/,
    "lazy"
  ),
  screens: require.context(
    "../chromatic/services/webapp/screens",
    true,
    /\.stories\.js$/,
    "lazy"
  ),
};

export const importFn = (name) => {
  const [_, contextName] = name.split("/", 2);
  return contexts[contextName](name.replace(`./${contextName}`, "."));
};
