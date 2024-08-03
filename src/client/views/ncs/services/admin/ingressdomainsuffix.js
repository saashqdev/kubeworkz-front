import Service from '@micro-app/common/services/service.js';

const apis = {
    load: {
        method: 'get',
        path: '/project/{projectId}',
    },
    modify: {
        method: 'post',
        path: '/project/{projectId}',
    },
    loadGlobal: {
        method: 'get',
        path: '/global',
    },
    modifyGlobal: {
        method: 'post',
        path: '/global',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends/ingressdomainsuffix');

export default service;
