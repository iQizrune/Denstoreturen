#!/usr/bin/env node
const os = require('os');
function line(s=''){process.stdout.write(String(s)+os.EOL);}
line('[report:timers] start');
line('status: ok (stub)');
line('details: bruker stub i tools/make-timer-map.js');
line('[report:timers] end');
