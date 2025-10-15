#!/usr/bin/env node
const os = require('os');
function line(s=''){process.stdout.write(String(s)+os.EOL);}
line('[report:imports] start');
line('status: ok (stub)');
line('details: bruker stub i tools/check-import-paths.js');
line('[report:imports] end');
