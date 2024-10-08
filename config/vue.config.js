
module.exports = {
    outputDir: 'public',
    publicPath: '/public/',
    filenameHashing: true,
    runtimeCompiler: true,
    lintOnSave: process.env.MICRO_APP_LINT_CONFG_SWITCH === 'close' ? false : process.env.NODE_ENV !== 'production', // Enabled by default
    transpileDependencies: [
        '@micro-app', // all
    ],
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/i,
                    use: [ "style-loader", "css-loader", "sass-loader" ],
                },
            ],
        },
    }
    
};
