import Service from '@micro-app/common/services/service.js';
import { normalizeTag } from '@micro-app/common/views/ncs/utils';
const apis = {
    // Get mirror list
    loads: {
        path: '/{clusterId}/repositories/getRepoTags',
        method: 'get',
    },
    load: {
        method: 'get',
        path: '/{clusterId}/repositories/getTag',
        process: (result) => {
            return normalizeTag(result.tag || {});
        },
    },
    // Delete image
    delete: {
        path: '/{clusterId}/repositories/deleteTag',
        method: 'post',
    },
};

const service = new Service(apis, '/repo/proxy/api/v1/harborproxy');
export default service;
