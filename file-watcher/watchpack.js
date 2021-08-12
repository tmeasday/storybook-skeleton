function setupFileWatcher({ projectDir, onChange, onRemove }) {
  const Watchpack = require("watchpack");

  // See https://www.npmjs.com/package/watchpack for full options.
  // If you want less traffic, consider using aggregation with some interval
  const wp = new Watchpack({
    // poll: true, // Slow!!! Enable only in special cases
    // Slower if enabled but the assumption is that some people use symlinks
    followSymlinks: false,
    ignored: "**/.git",
  });
  wp.watch({
    directories: [projectDir],
  });
  wp.on("change", onChange);
  wp.on("remove", onRemove);

  return wp;
}

module.exports = {
  setupFileWatcher,
};
