import Service from '@micro-app/common/services/service.js';
const apis = {
    create: {
        method: 'post',
        path: '/clusters/{clusterId}/hpa',
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/namespaces/{namespace}/{kind}/{name}/hpa',
    },
    load: {
        method: 'get',
        noAlert: true,
        path: '/clusters/{clusterId}/namespaces/{namespace}/{kind}/{name}/hpa',
    },
    stop: {
        method: 'delete',
        path: '/clusters/{clusterId}/namespaces/{namespace}/{kind}/{name}/hpa',
    },
    exist: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/{kind}/{name}/hasHpa',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
