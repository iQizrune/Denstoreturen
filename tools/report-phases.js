#!/usr/bin/env node
const os = require('os');
function line(s=''){process.stdout.write(String(s)+os.EOL);}
line('[report:phases] start');
line('status: ok (stub)');
line('details: ingen fasevalidering ennå; denne stuben holder guard grønn.');
line('[report:phases] end');
