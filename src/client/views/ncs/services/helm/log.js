import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/extends/helm/operations/records',
        process: result => {
            return {
                total: result.total || 0,
                list: result.records || [],
            };
        },
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs');

export default service;
