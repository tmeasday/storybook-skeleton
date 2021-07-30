const WebSocket = require("ws");
const { eventTypes } = require("./event-types");

// This code expects the server is already running.
const ws = new WebSocket("ws://localhost:8080");

/*
Example story:
{
  'buttontoggle--outlinebuttonssmall': {
    id: 'buttontoggle--outlinebuttonssmall',
    name: 'OutlineButtonsSmall',
    parameters: [Object],
    kind: 'ButtonToggle'
  }
  ...
}
*/
let stories = {};

ws.on("open", () => {
  ws.send("hello from client");
});

ws.on("message", (data) => {
  try {
    const { type, payload } = JSON.parse(data);

    switch (type) {
      case eventTypes.INITIALIZE_STORIES:
        stories = payload;
        break;
      case eventTypes.PATCH_STORIES:
        Object.entries(payload).forEach(([k, v]) => {
          stories[k] = v;
        });
        break;
      default:
        console.warn("Unknown event type: %s", type);
        break;
    }
  } catch (error) {
    console.error(error);
  }
});
