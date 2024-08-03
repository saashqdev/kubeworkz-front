import Service from '@micro-app/common/services/service.js';
const apis = {
    loads: {
        method: 'get',
        path: '/chartrepo/members',
    },
    create: {
        method: 'post',
        path: '/chartrepo/member',
    },
    delete: {
        method: 'delete',
        path: '/chartrepo/member',
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');

export default service;
