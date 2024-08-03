import Service from '@micro-app/common/services/service.js';
const apis = {
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/quota/tenant',
    },
    modify: {
        method: 'post',
        path: '/clusters/{clusterId}/quota/tenant',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
