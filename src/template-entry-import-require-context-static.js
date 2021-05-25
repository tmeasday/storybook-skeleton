const requireContext = require.context(
  "./template",
  true,
  /.*\.stories\.loader\.jsx$/
);

export const importFn = (name) =>
  requireContext(name.replace(".stories.", ".stories.loader.")).importFn();
