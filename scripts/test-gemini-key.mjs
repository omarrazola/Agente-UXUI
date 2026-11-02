import fetch from "node-fetch";

async function testGemini() {
  const res = await fetch("http://localhost:8787/api/config/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service: "gemini", apiKey: "dummy_key_123" })
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Body:", data);
}

testGemini().catch(console.error);
