// The project concept in harborproxy (third-party application) is mapped with the project in Fort Erie
import Service from '@micro-app/common/services/service.js';

const apis = {
    // Get project list
    loads: {
        path: '/{clusterId}/projects/getProjects',
        method: 'post',
    },
    // Create a private mirror library
    create: {
        path: '/{clusterId}/projects/createProject',
        method: 'post',
    },
    // Have you created a private mirror library?
    projectExist: {
        path: '/{clusterId}/projects/projectExists',
        method: 'get',
    },
    // type - type, 1 public 2 private 3 all common
    loadImages: {
        path: '/{clusterId}/projects/getImageLists',
        method: 'get',
        process: (result = {}) => ({
            list: result.repositories || [],
            total: result.total || 0,
            harbor: result.harbor || '',
        }),
    },
    // Determine whether the current user is an authorized user of the current Harbar project [Only authorized users can set passwords]
    userExist: {
        path: '/users/userExist',
        method: 'get',
    },
    // reset Password
    resetPassword: {
        path: '/users/resetPassword',
        method: 'post',
    },
    // Get current user role information
    loadUserInfo: {
        path: '/users/getRoleInfo',
        method: 'get',
    },
    loadHarborInfo: {
        path: '/getHarborInfo',
        method: 'get',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
