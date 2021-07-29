const path = require("path");
const { Server } = require("ws");
const { setupFileWatcher } = require("./file-watcher");

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

  const wp = setupFileWatcher(projectDir);

  // TODO: Refine further + add effects related to file watching
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("received: %s", message);
    });

    ws.send("hello");
  });

  wss.on("close", () => wp.close());

  console.log(`websocket server started at ws://localhost:${port}`);
}

setupServer({
  port: 8080,
  projectDir: path.join(process.cwd(), "design-system"),
});
