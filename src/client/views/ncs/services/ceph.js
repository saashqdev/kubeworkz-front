import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/cephclusters',
    },
    createCeph: {
        method: 'post',
        path: '/cephclusters',
    },
    loadPools: {
        method: 'get',
        path: '/cephclusters/{cephClusterId}/pools',
    },
    addPool: {
        method: 'post',
        path: '/cephclusters/{cephClusterId}/pools',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
