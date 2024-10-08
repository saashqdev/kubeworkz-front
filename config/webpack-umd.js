/**
 * The common umd part is introduced during development to speed up packaging.
 */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (config, { dirname }) => {
    config.resolve.alias
        .set('library$', path.resolve(__dirname, '../umd/common.js'));
    config
        .plugin('copy-umd')
        .use(CopyPlugin, [[{
            from: path.resolve(__dirname, '../umd'),
            to: path.resolve(dirname, '../public'),
        }]])
        .end();
    return config;
};
