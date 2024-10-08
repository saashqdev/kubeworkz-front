import Service from '@micro-app/common/services/service.js';

const apis = {
    create: {
        method: 'post',
        path: '/clusters/{clusterId}/namespaces/{namespace}/poddisruptionbudgets',
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/namespaces/{namespace}/poddisruptionbudgets',
    },
    load: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/poddisruptionbudgets/{name}',
    },
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/poddisruptionbudgets',
    },
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/namespaces/{namespace}/poddisruptionbudgets/{name}',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
