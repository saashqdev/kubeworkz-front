import Service from '@micro-app/common/services/service.js';
const apis = {
    load: {
        path: '/clusters/{clusterId}/quota/{resource}',
        method: 'get',
    },
    modify: {
        path: '/clusters/{clusterId}/quota',
        method: 'post',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
