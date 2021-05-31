export const importFn = require.context(
  "../design-system/src",
  true,
  /.*\.stories\.[j|t]sx?$/,
  "lazy"
);
