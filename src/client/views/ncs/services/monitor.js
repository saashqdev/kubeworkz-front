import Service from '@micro-app/common/services/service.js';
import { at } from 'lodash';
const apis = {
    load: {
        method: 'get',
        path: '/query',
        process: (result) => {
            const [tmp] = at(result || {}, [ 'data[0].samples[0].value' ]);
            return tmp || 0;
        },
    },
    loadRange: {
        method: 'get',
        path: '/query_range',
    },
    // It is the same interface as load, but will return complete information
    loadAllInfo: {
        method: 'get',
        path: '/query',
        process: (result) => {
            return result.data;
        },
    },

};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends/monitor');

export default service;
