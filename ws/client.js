const WebSocket = require("ws");

// This code expects the server is already running.
const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  ws.send("hello from client");
});

ws.on("message", (message) => {
  console.log("received: %s", message);
});
