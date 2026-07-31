const { io } = require("socket.io-client");
const socket = io("http://127.0.0.1:3001/voice-assistant", {
  transports: ["websocket"]
});
socket.on("connect", () => {
  console.log("Connected via WebSocket!");
  process.exit(0);
});
socket.on("connect_error", (err) => {
  console.log("Error:", err.message);
  process.exit(1);
});
