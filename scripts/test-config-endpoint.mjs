import fetch from "node-fetch";

async function run() {
  console.log("Testing /api/config/test endpoint...");
  const res = await fetch("http://localhost:8787/api/config/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: "unknown" })
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Body:", data);
}

run().catch(console.error);
