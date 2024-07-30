
const path = require('path');

// register plugins

module.exports = [
    '@micro-app/vue-cli-plugin-microapp',
    [ '@micro-app/plugin-compatible', { server: true }], // Adapt v1
    [ // 0
        {
            id: 'common:plugins-custom-command',
            link: path.resolve(__dirname, './command.js'),
            description: 'Public common provides custom commands',
        },
    ],
    [ // 1
        {
            id: 'common:plugins-enhance-webpack',
            link: path.resolve(__dirname, './enhance-webpack.js'),
            description: 'Common provides enhanced webpack configuration',
        },
    ],
];
