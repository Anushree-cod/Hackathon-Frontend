const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allows .bin files to be bundled
config.resolver.assetExts.push('bin');

module.exports = config;