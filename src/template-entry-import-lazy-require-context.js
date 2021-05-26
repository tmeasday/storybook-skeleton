export const importFn = require.context(
  "./template",
  true,
  /.*\.stories\.jsx$/,
  "lazy"
);
