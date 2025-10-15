#!/usr/bin/env node
const os = require('os');
function line(s=''){process.stdout.write(String(s)+os.EOL);}
line('[report:phases] start');
line('status: ok (stub)');
line('details: bruker stub i tools/make-phase-map.js');
line('[report:phases] end');
