const packageInfo = require("./package.json");
const fs = require("node:fs");

fs.writeFile("./data/version.json", JSON.stringify({
  version: packageInfo.version
}),
err => err ? console.error(err) : console.log(packageInfo.version));