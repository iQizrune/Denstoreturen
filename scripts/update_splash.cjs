const fs = require('fs');
const file = 'app.json';
if (!fs.existsSync(file)) { process.stderr.write('app.json not found\n'); process.exit(1); }
let json;
try { json = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { process.stderr.write('invalid app.json\n'); process.exit(1); }
json.expo = json.expo || {};
json.expo.splash = json.expo.splash || {};
json.expo.splash.image = json.expo.splash.image || "./assets/images/krikerogkrokerlogo.png";
json.expo.splash.resizeMode = "contain";
json.expo.splash.backgroundColor = "#0b132b";
json.expo.splash.dark = json.expo.splash.dark || {};
json.expo.splash.dark.image = json.expo.splash.dark.image || "./assets/images/krikerogkrokerlogo.png";
json.expo.splash.dark.backgroundColor = "#0b132b";
fs.writeFileSync(file, JSON.stringify(json, null, 2));
process.stdout.write('updated splash in app.json\n');
