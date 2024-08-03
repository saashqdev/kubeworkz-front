import request from '@micro-app/common/services/request';
const prefix = '/ncs/proxy/api/v1/ncs';
export default {
    /**
     * Node
     */

    // Get node list
    listNode: ({ id, body }) => request.get(`${prefix}/clusters/${id}/nodes`, body),

    // Get node details
    getNode: ({ id, name }) => request.get(`${prefix}/clusters/${id}/nodes/${name}`),

    // Add node
    addNode: ({ id, body }) => request.post(`${prefix}/extends/clusters/${id}/nodes/initNode`, body),

    // Update node
    updateNode: ({ id, name, body }) => request.put(`${prefix}/clusters/${id}/nodes/${name}`, body),

    // Get all events under a certain cluster
    listEvents: ({ id, body }) => request.get(`${prefix}/extends/clusters/${id}/events`, body),

    /**
     * Cluster
     */

    // Get cluster list
    listCluster: () => request.get(`${prefix}/extends/clusters`),

    // Get cluster details
    getCluster: ({ id }) => request.get(`${prefix}/extends/clusters/${id}`),

    /**
     * Namespaces
     */

    // Get list of spaces
    listNameSpace: ({ id, body }) => request.get(`${prefix}/clusters/${id}/namespaces`, body),

    // Create space
    createNameSpace: ({ id, body }) => request.post(`${prefix}/clusters/${id}/namespaces`, body),

    // Update space
    updateNameSpace: ({ id, nsName, body }) => request.put(`${prefix}/clusters/${id}/namespaces/${nsName}`, body),

    // Delete space
    deleteNameSpace: ({ id, nsName }) => request.delete(`${prefix}/clusters/${id}/namespaces/${nsName}`),

    // Create quota space
    createResourceQuota: ({ id, nsName, body }) => request.post(`${prefix}/clusters/${id}/namespaces/${nsName}/resourcequotas`, body),

    // Update quota
    updateResourceQuota: ({ id, nsName, name, body }) => request.put(`${prefix}/clusters/${id}/namespaces/${nsName}/resourcequotas/${name}`, body),

    // Get each space quota
    loadNSQuota: ({ id, nsName, name }) => request.get(`${prefix}/clusters/${id}/namespaces/${nsName}/resourcequotas/${name}`),
};
