// TODO: Connect the events with a websocket server
function setupFileWatcher(projectDir) {
  const Watchpack = require("watchpack");

  // See https://www.npmjs.com/package/watchpack for full options.
  // If you want less traffic, consider using aggregation with some interval
  const wp = new Watchpack({
    poll: true,
    // Slower but the assumption is that some people use symlinks
    followSymlinks: true,
    ignored: "**/.git",
  });

  wp.watch({
    directories: [projectDir],
  });

  wp.on("change", (filePath, mtime, explanation) => {
    // filePath: the changed file
    // mtime: last modified time for the changed file
    // explanation: textual information how this change was detected
    console.log("changed", { filePath, mtime, explanation });
  });

  wp.on("remove", (filePath, explanation) => {
    // filePath: the removed file or directory
    // explanation: textual information how this change was detected
    console.log("removed", { filePath, explanation });
  });

  // TODO: This probably should get called when the server is being shut down
  // wp.close();
}

module.exports = {
  setupFileWatcher,
};
