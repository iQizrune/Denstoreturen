#!/usr/bin/env node
const os = require('os');
function line(s=''){process.stdout.write(String(s)+os.EOL);}
line('[report:timers] start');
line('status: ok (stub)');
line('details: ingen analyser kjøres ennå; klar for å kobles til senere regler.');
line('[report:timers] end');
