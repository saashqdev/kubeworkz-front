import Service from '@micro-app/common/services/service.js';

const apis = {
    create: {
        path: '/{harborId}/targets/create',
        method: 'post',
        noAlert: true,
    },
    load: {
        method: 'get',
        path: '/{harborId}/targets/{targetId}',
    },
    loads: {
        method: 'get',
        path: '/{harborId}/targets/list',
    },
    // The same function as the loads interface, but obtained through the clusterId (used to obtain the copy rule setting page)
    loadsByClusterId: {
        method: 'get',
        path: '/targets/list',
    },
    modify: {
        method: 'put',
        path: '/{harborId}/targets/{targetId}/update',
        noAlert: true,
    },
    delete: {
        method: 'delete',
        path: '/{harborId}/targets/{targetId}',
        noAlert: true,
    },
    check: {
        method: 'get',
        path: '/checkHarbor',
    },
    ping: {
        method: 'post',
        path: '/{harborId}/targets/ping',
    }
};
const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
