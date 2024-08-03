import Service from '@micro-app/common/services/service.js';
const apis = {
    create: {
        method: 'post',
        path: '/clusters/{clusterId}/namespaces/{namespace}/openshifsdn/egressnetworkpolicy',
        noAlert: true,
    },
    modify: {
        method: 'put',
        path: '/clusters/{clusterId}/namespaces/{namespace}/openshifsdn/egressnetworkpolicy',
    },
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/namespaces/{namespace}/openshifsdn/egressnetworkpolicy',
    },
    // Query whether the cluster has an associated Openshift network policy, and if so, return specific information.
    check: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/openshifsdn/egressnetworkpolicy/checkorget',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;

