// The project concept in harborproxy (third-party application) is mapped with the project in Fort Erie
import Service from '@micro-app/common/services/service.js';

const apis = {
    loads: {
        method: 'get',
        path: '/chartrepo/getVersionList',
    },
    load: {
        method: 'get',
        path: '/chartrepo/version',
    },
    delete: {
        method: 'delete',
        path: '/chartrepo/version',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
