const path = require("path");
const { Server } = require("ws");
const { readCsf } = require("@storybook/csf-tools");

const { setupFileWatcher } = require("./file-watcher");
const { extractStoriesJson } = require("../webpack/stories-json");
const { measure } = require("../src/measure");
const { eventTypes } = require("./event-types");

const projectDir = path.join(process.cwd(), "design-system");

function setupServer({ port, projectDir }) {
  // TODO: Figure out good defaults
  const wss = new Server({
    port: port || 8080,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024, // Size (in bytes) below which messages
      // should not be compressed.
    },
  });

  // Assuming only a single connection for now (this can be generalized)
  let connection;

  // TODO: Refine further + add effects related to file watching
  wss.on("connection", (ws) => {
    connection = ws;

    connection.on("message", (message) => {
      console.log("received: %s", message);
    });

    // Send initial stories. The rest will be patched by the client based on fs events
    measure("send initial stories", async () => {
      try {
        const storiesJson = await parseStoriesJson(projectDir);

        connection &&
          connection.send(
            JSON.stringify({
              type: eventTypes.INITIALIZE_STORIES,
              payload: storiesJson.stories,
            })
          );
      } catch (err) {
        console.error(err);
      }
    });
  });

  const wp = setupFileWatcher({
    projectDir,
    // filePath: the changed file
    // mtime: last modified time for the changed file
    // explanation: textual information how this change was detected
    onChange: (filePath, mtime, explanation) => {
      // TODO: Likely this will connect with the configuration somehow
      if (
        filePath.endsWith(".stories.js") ||
        filePath.endsWith(".stories.jsx") ||
        filePath.endsWith(".stories.ts") ||
        filePath.endsWith(".stories.tsx")
      ) {
        measure("send changed stories", async () => {
          try {
            const csf = (await readCsf(filePath)).parse();
            const relativePath = path.relative(projectDir, filePath);

            // TODO: Copied over from stories-json.js -> extract shared logic
            const patches = {};
            csf.stories.forEach((story) => {
              patches[story.id] = {
                ...story,
                kind: csf.meta.title,
                parameters: { ...story.parameters, fileName: relativePath },
              };
            });

            connection &&
              connection.send(
                JSON.stringify({
                  type: eventTypes.PATCH_STORIES,
                  payload: patches,
                })
              );
          } catch (err) {
            console.error(err);
          }
        });
      }
    },
    // filePath: the removed file or directory
    // explanation: textual information how this change was detected
    onRemove: (filePath, explanation) => {
      console.log("on remove", filePath, explanation);

      // TODO: Figure out the name of the removed story and send that
    },
  });

  wss.on("close", () => wp.close());

  console.log(`websocket server started at ws://localhost:${port}`);
}

async function parseStoriesJson(configDir) {
  return await extractStoriesJson({
    configDir,
    stories: "./src/**/*.stories.(jsx|tsx)",
  });
}

setupServer({
  port: 8080,
  projectDir,
});
