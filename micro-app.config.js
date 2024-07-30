

const path = require('path');

module.exports = {
    version: '0.0.1',
    type: '', // Types type
    entry: {
        index: [ './src/kubeworkz/index.js' ],
    },
    htmls: [{
        filename: 'index.html',
        title: 'Kubecube',
        hash: true,
        template: './src/template/index.html',
    }],
    staticPath: path.resolve(__dirname, 'src/client/static/'),
    alias: { // Front and backend
        library: {
            link: path.resolve(__dirname, 'src/client/components/'),
            description: 'Common dependent components',
        },
        components: {
            link: path.resolve(__dirname, 'src/client/components/'),
            description: 'Common dependent components',
        },
        elComponent: {
            link: path.resolve(__dirname, 'src/client/elComponent/'),
            description: 'el extension component',
        },
        base: path.resolve(__dirname, 'src/client/base/'),
        mixins: path.resolve(__dirname, 'src/client/base/mixins/'),
        filters: path.resolve(__dirname, 'src/client/filters/'),
        directives: path.resolve(__dirname, 'src/client/directives/'),
        utils: path.resolve(__dirname, 'src/client/utils/'),
        assets: path.resolve(__dirname, 'src/client/assets/'),
        icons: path.resolve(__dirname, 'src/client/assets/icons/'),
        static: path.resolve(__dirname, 'src/client/static/'),
        views: path.resolve(__dirname, 'src/client/views/'),
        services: path.resolve(__dirname, 'src/client/services/'),

        kubeworkz: path.resolve(__dirname, 'src/kubeworkz/'),
        // jchart: path.resolve(__dirname, 'src/JChart/'),
    },

    plugins: require('./plugins'),

    // The following is the development test function
    devServer: {
        port: '4330',
    },
};
