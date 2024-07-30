const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
module.exports = function(api, opts) {
    const __DEV__ = api.mode === 'development';
    const root = api.root; // Main container root directory

    // Modify the general webpack configuration, this modification will be used by all modules.
    api.modifyChainWebpackConfig(webpackChainConfig => {
    //     add(webpackChainConfig, 'dll', Object.assign({}, opts, { root }));
        add(webpackChainConfig, 'ui', Object.assign({}, opts, { root }));
        // locked path
        console.log(require.resolve('vue'))
        console.log(require.resolve('@joskii/jchart'))
        webpackChainConfig.resolve.alias
            .set('@necfe/cloud-ui-internal', path.resolve(__dirname, '../lib/cloud-ui-internal'))
            .set('vue$', require.resolve('vue/dist/vue.esm.js'))
            .set('vue-router$', require.resolve('vue-router/dist/vue-router.esm.js'))
            .set('vuex$', require.resolve('vuex/dist/vuex.esm.js'))
            .set('kubeworkz', path.resolve(__dirname, '../src/kubeworkz'))
            .set('jchart', require.resolve('@joskii/jchart'));

        webpackChainConfig
            .context(root)
            .output
            .filename(__DEV__ ? '[name].js' : '[name].[hash].js')
            .end();

        webpackChainConfig.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                options.compilerOptions.preserveWhitespace = false; // Compatible with previous versions
                return options;
            });
        webpackChainConfig.plugin('monaco-webpack-plugin').use(MonacoWebpackPlugin, [{
            languages: [ 'yaml', 'shell' ],
            filename: 'monaco-editor',
        }]);
        webpackChainConfig.plugin('html-index').tap(
            args => ([{
                ...args[0],
                template: path.resolve(__dirname, '../template/kubeworkz.html'),
                favicon: path.resolve(__dirname, '../src/kubeworkz/component/global/icon/logo.png'),
            }]));
        // webpackChainConfig.plugin('bundle-analyzer').use(BundleAnalyzerPlugin);
        return webpackChainConfig; // Must return
    });
};
function add(config, fnName, options) {
    const configFn = require(`../config/webpack-${fnName}.js`);
    if (configFn instanceof Function) { configFn(config, options); }
}
