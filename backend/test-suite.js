import fetch from "node-fetch";

async function runTests() {
  console.log("Testing Backend Health...");
  try {
    const health = await fetch("http://localhost:3001/api/health").then(res => res.json());
    console.log("Health:", health);
  } catch (e) {
    console.error("Health check failed:", e);
  }

  // Socket testing needs a socket.io client.
}

runTests();
