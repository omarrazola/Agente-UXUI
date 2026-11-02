import http from "http";

http.get("http://localhost:8787/", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log("HTTP Status:", res.statusCode);
    console.log("Headers:", res.headers);
    console.log("Contains toggleAdvBrief?:", data.includes("toggleAdvBrief"));
    console.log("Contains onclick on advBriefToggle?:", data.includes("onclick=\"window.toggleAdvBrief"));
    console.log("Size:", data.length);
  });
});
