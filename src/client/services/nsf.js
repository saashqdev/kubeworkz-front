import Service from './service.js';

const metaapis = {
    // Get all component information
    getAllEnvInfo: {
        method: 'get',
        path: '/api/metadata',
        query: {
            Action: 'GetAllEnvInfo',
            Version: '2018-11-1',
        },
        process: ({ Result = [] }) => Result,
    },
};

const meta = new Service(metaapis, '/meta/redirect');
const service = Object.assign({}, meta);
export default service;
