import Service from '@micro-app/common/services/service.js';

const apis = {
    loads: {
        method: 'get',
        path: '/clusters/{clusterId}/openshiftsdn/securitygroups',
    },
    editGlobal: {
        method: 'post',
        path: '/clusters/{clusterId}/openshiftsdn/securitygroups/global',
    },
    // It also supports adding, setting and deleting security groups.
    editJoined: {
        method: 'post',
        path: '/clusters/{clusterId}/openshiftsdn/securitygroups/joined',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;

