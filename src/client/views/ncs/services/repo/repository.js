// The project concept in harborproxy (third-party application) is mapped with the project in Fort Erie
import Service from '@micro-app/common/services/service.js';

const apis = {
    // Get warehouse list
    loads: {
        path: '/{clusterId}/repositories/getRepositories',
        method: 'post',
    },
    // Delete warehouse
    delete: {
        path: '/{clusterId}/repositories/deleteRepository',
        method: 'post',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
