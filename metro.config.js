// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  if (!config.resolver.assetExts.includes('html')) {
    config.resolver.assetExts.push('html');
  }

  // Viktig: ikke tukle med .json – la Metro håndtere JSON som modul.

  return config;
})();
