// The project concept in harborproxy (third-party application) is mapped with the project in Fort Erie
import Service from '@micro-app/common/services/service.js';

const apis = {
    // Get user list
    loads: {
        path: '/{clusterId}/projects/{projectId}/getMembers',
        method: 'post',
    },
    // User authorization
    create: {
        path: '/{clusterId}/projects/{projectId}/addMember',
        method: 'post',
    },
    // Remove user
    remove: {
        path: '/{clusterId}/projects/{projectId}/deleteMember',
        method: 'post',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
