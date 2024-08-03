import Service from '@micro-app/common/services/service.js';
import cookie from '@micro-app/common/utils/handleCookie';

const apis = {
    download: {
        method: 'get',
        download: true,
        path: '/kubeconfig/certificate/action/download',
        query: {
            'x-auth-accountId': cookie.readCookie('accountId'),
            'x-auth-tenantId': cookie.readCookie('tenantId'),
            'x-auth-projectId': cookie.readCookie('projectId'),
        },
    },
};

// /ncs/proxy is the prefix required for the front-end proxy interface
const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends');

export default service;
