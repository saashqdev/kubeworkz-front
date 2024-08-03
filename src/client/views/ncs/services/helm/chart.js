// The project concept in harborproxy (third-party application) is mapped with the project in Fort Erie
import Service from '@micro-app/common/services/service.js';
import cookie from '@micro-app/common/utils/handleCookie';

const apis = {
    loads: {
        method: 'get',
        path: '/chartrepo/getChartList',
    },
    upload: {
        method: 'post',
        path: '/chartrepo/upload',
        dataType: 'formData',
        noAlert: true,
    },
    download: {
        method: 'get',
        download: true,
        path: '/chartrepo/download',
        query: {
            'x-auth-accountId': cookie.readCookie('accountId'),
            'x-auth-tenantId': cookie.readCookie('tenantId'),
            'x-auth-projectId': cookie.readCookie('projectId'),
        },
    },
    // Whether the private template is enabled
    load: {
        method: 'get',
        path: '/chartrepo/project',
    },
    create: {
        method: 'post',
        path: '/chartrepo/createProject',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
