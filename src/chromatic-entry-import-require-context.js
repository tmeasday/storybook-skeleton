export const importFn = require.context(
  "../chromatic/services/webapp",
  true,
  /.*\.stories\.js$/
);
