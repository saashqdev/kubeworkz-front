import Service from './service.js';

const Version = '2018-11-19';

const TXService = {
    // Get all component information
    loadSummary: {
        method: 'get',
        path: '',
        query: {
            Action: 'DescribeTxSummary',
            Version,
        },
        process: (result = {}) => result,
    },
};

// /gtxs/proxy is the prefix required for the front-end proxy interface
const service = new Service(TXService, '/gtxs/proxy/gtxs');

export default service;
