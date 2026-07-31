const io = require("socket.io-client");
const socket = io("http://localhost:3001/voice-assistant", { transports: ["websocket"] });
const mainSocket = io("http://localhost:3001", { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("Voice Socket connected");
  console.log("Sending project creation intent...");
  socket.emit("voice_message", { text: "I want to build a SaaS platform for dentists to manage their clinic, appointments, and billing." });
});

let testWorkflowId = null;

socket.on("voice_reply", (data) => {
  console.log("Voice Reply:", data.reply);
  if (data.workflowId) {
    console.log("SUCCESS: Captured workflow ID:", data.workflowId);
    testWorkflowId = data.workflowId;
  } else {
    console.log("ERROR: No workflow ID returned");
    process.exit(1);
  }
});

mainSocket.on("workspace_document_ready", (data) => {
  console.log("Document Ready:", data.tabName);
});
mainSocket.on("agent_progress", (data) => {
  console.log("Agent:", data.name, data.status);
});
mainSocket.on("workspace_progress", (data) => {
  console.log("Overall Progress:", data.percent + "%", data.currentPhase);
});
mainSocket.on("workflow_completed", (data) => {
  console.log("Workflow Completed successfully:", data.id);
  process.exit(0);
});

setTimeout(() => {
  console.log("Test timeout");
  process.exit(1);
}, 120000);
