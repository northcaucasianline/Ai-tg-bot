// SEA entry point. SEA provides a limited require(); recreate a file-based require
// so bundled modules that need Node's module loader behave normally.
const { createRequire } = require('node:module');
require = createRequire(__filename);
process.env.AIDA_SEA = "1";
require("./src/index.js");
