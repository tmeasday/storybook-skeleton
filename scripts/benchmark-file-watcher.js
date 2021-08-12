const path = require("path");
const shell = require("shelljs");
const { setupFileWatcher } = require("../file-watcher/watchpack");

const projectDir = path.join(process.cwd(), "design-system");
const avatarStories = path.join(projectDir, "src/components/Avatar.stories.js");

// The idea behind the benchmark is to touch a file and then measure how long
// it takes for onChange to trigger
function benchmarkFileWatcher() {
  let start, hrstart;

  const wp = setupFileWatcher({
    projectDir,
    onChange: (filePath) => {
      const end = new Date() - start;
      const hrend = process.hrtime(hrstart);

      console.log(`${filePath} changed`);

      console.info("Execution time: %dms", end);
      console.info(
        "Execution time (hr): %ds %dms",
        hrend[0],
        hrend[1] / 1000000
      );

      // Close file watcher since we received an event
      wp.close();
    },
    onRemove: () => {},
  });

  // It seems to take a while for file watcher to be available so there's
  // an artificial delay in the beginning.
  setTimeout(() => {
    start = new Date();
    hrstart = process.hrtime();

    console.log(`Touching ${avatarStories}`);
    if (shell.touch(avatarStories).code !== 0) {
      console.log("Failed to touch");
    }
  }, 1000);
}

benchmarkFileWatcher();
