import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces',
        // clusterId: 1,
    },
    loadsExternal: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces',
    },
    create: {
        method: 'post',
        path: '/extends/clusters/{clusterId}/namespace',
    },
    load: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespace/{nsName}',
    },
    modify: {
        method: 'put',
        path: '/extends/clusters/{clusterId}/namespace',
    },
    // Native delete namespace
    delete: {
        method: 'delete',
        path: '/clusters/{clusterId}/namespaces/{nsName}',
    },
    deleteExternal: {
        method: 'delete',
        path: '/extends/clusters/{clusterId}/namespace/{nsName}',
    },
    // A project is associated with multiple namespaces at the same time
    link: {
        method: 'post',
        path: '/extends/project/namespaces',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs');

export default service;
