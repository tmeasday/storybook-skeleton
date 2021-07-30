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
            connection &&
              connection.send(
                JSON.stringify({
                  type: eventTypes.PATCH_STORIES,
                  payload: await getStories(projectDir, filePath),
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

      // TODO: Figure out the name of the removed story and send that. It's a
      // simple delete operation against each story at the client then.

      // TODO: Convert to async for an extra bit of perf
      if (fs.lstatSync(path_string).isDirectory()) {
        // Since directories can contain stories, likely in this case it's safest
        // regenerate all stories. The question is, does the client still need
        // to know what changed (is it useful info?). If so, it's also possible
        // to return the deleted stories like in the other case (simpler)
      }
      // TODO: Likely this will connect with the configuration somehow
      else if (
        filePath.endsWith(".stories.js") ||
        filePath.endsWith(".stories.jsx") ||
        filePath.endsWith(".stories.ts") ||
        filePath.endsWith(".stories.tsx")
      ) {
        measure("send deleted stories", async () => {
          try {
            connection &&
              connection.send(
                JSON.stringify({
                  type: eventTypes.DELETE_STORIES,
                  payload: await getStories(projectDir, filePath),
                })
              );
          } catch (err) {
            console.error(err);
          }
        });
      }
    },
  });

  wss.on("close", () => wp.close());

  console.log(`websocket server started at ws://localhost:${port}`);
}

// TODO: Copied over from stories-json.js -> push there?
async function getStories(projectDir, filePath) {
  const ret = {};
  const csf = (await readCsf(filePath)).parse();
  const relativePath = path.relative(projectDir, filePath);

  csf.stories.forEach((story) => {
    ret[story.id] = {
      ...story,
      kind: csf.meta.title,
      parameters: { ...story.parameters, fileName: relativePath },
    };
  });

  return ret;
}

async function parseStoriesJson(configDir) {
  return await extractStoriesJson({
    configDir,
    stories: "./src/**/*.stories.(js|ts|jsx|tsx)",
  });
}

setupServer({
  port: 8080,
  projectDir,
});
