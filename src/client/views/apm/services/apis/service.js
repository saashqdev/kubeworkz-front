const prefix = '/apm/redirect/api/v1/products/{tenantId}/{productId}';
const prefixV2 = '/apm/redirect/api/v2/products/{tenantId}/{productId}';
export default {
    /**
     * Service list interface
     */
    getServices: {
        path: prefix + '/serviceOverview',
        method: 'get',
    },
    /**
     * Get service exception list
     */
    getExceptionList: {
        path: prefixV2 + '/exceptionOverview/{serviceName}',
        method: 'get',
    },
    /**
     * Get service exception details
     */
    getException: {
        path: prefixV2 + '/getMetricData',
        method: 'post',
    },
    /**
     * Query service API monitoring data
     */
    getApiMonitor: {
        path: prefixV2 + '/serviceEndpointList',
        method: 'post',
    },
    /**
     * Get node information associated with container monitoring
     */
    getNodeInfo: {
        path: prefixV2 + '/nodes',
        method: 'post',
    },
};
