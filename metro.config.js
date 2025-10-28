const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  '@components': path.resolve(__dirname, 'src/components'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@constants': path.resolve(__dirname, 'src/constants.ts'),
  '@theme': path.resolve(__dirname, 'src/theme.ts'),
};

module.exports = config;
