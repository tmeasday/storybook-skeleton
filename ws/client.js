const WebSocket = require("ws");
const { eventTypes } = require("./event-types");

// This code expects the server is already running.
const ws = new WebSocket("ws://localhost:8080");

let stories = {};

ws.on("open", () => {
  ws.send("hello from client");
});

ws.on("message", (data) => {
  try {
    const { type, payload } = JSON.parse(data);

    switch (type) {
      case eventTypes.INITIALIZE:
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
        stories = payload.stories;
        break;
      default:
        console.warn("Unknown event type: %s", type);
        break;
    }
  } catch (error) {
    console.error(error);
  }
});
