const WebSocket = require("ws");
const { reduceStories } = require("./reduce-stories");

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
    const ret = reduceStories({ type, payload, initialData: stories });

    if (ret) {
      stories = ret;

      // To understand how long file watching operation took, use command like
      // date '+%s' && touch Input.stories.js and then subtract the timestamps
      console.log(
        "timestamp:",
        // Time in seconds
        Math.floor(new Date().getTime() / 1000),
        "event type:",
        type,
        "stories length:",
        Object.keys(stories).length
      );
    }
  } catch (error) {
    console.error(error);
  }
});
