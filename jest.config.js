module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // React Navigation (and friends) ship untranspiled ESM; the default
  // preset only transforms react-native itself.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*|lottie-react-native)/)',
  ],
};
