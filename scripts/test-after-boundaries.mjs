import fs from "fs";

let html = fs.readFileSync("public/index.html", "utf8");
const startMarker = '<div class="after">';
const endMarker = '</div>\r\n    </div>\r\n  </div>\r\n</section>';
const altEndMarker = '</div>\n    </div>\n  </div>\n</section>';

const startIdx = html.indexOf(startMarker);
let endIdx = html.indexOf(endMarker, startIdx);
let delimiter = endMarker;
if (endIdx === -1) {
  endIdx = html.indexOf(altEndMarker, startIdx);
  delimiter = altEndMarker;
}

console.log("startIdx:", startIdx, "endIdx:", endIdx);
console.log("FOUND SLICE:\n", html.slice(startIdx, endIdx));
