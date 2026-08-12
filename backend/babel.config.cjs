/**
 * Jest-only Babel config.
 *
 * The app itself is compiled by ts-jest/tsc. This config exists solely so
 * babel-jest can transpile the ESM-only packages nested under
 * @blend-capital/blend-sdk (@noble/hashes, @stellar/stellar-sdk, eventsource)
 * into CJS when jest loads them. Those packages ship no CommonJS build, so
 * without this transform jest throws "Cannot use import statement outside a
 * module". See transformIgnorePatterns in package.json.
 */
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
