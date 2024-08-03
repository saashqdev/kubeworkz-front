import { prefixV1, prefix, prefixV1Products } from '../base.js';
const productPrefix = prefix + '/{product}';
export default {
    loads: {
        path: prefixV1Products + '/getProducts',
        method: 'get',
    },
    filterStatistics: {
        path: prefixV1 + '/statistics',
        method: 'get',
    },
    /**
     * Get an overview of monitoring data under space
     */
    overview: {
        path: prefixV1 + '/productOverview/{productName}',
        method: 'get',
    },
    serviceOverview: {
        path: prefixV1 + '/{productId}/serviceOverview/{serviceNames}',
        method: 'get',
    },
    abnormalDetails: {
        path: prefixV1 + '/request/abnormalDetails',
        method: 'get',
    },
    statistics: {
        path: prefix + '/serviceOverview/{product}/statistics',
        method: 'get',
    },
    /**
     * Health record
     */
    health: {
        path: prefixV1 + '/health/abnormalDetails',
        method: 'get',
    },
    statisticsV1: {
        path: prefixV1 + '/statistics',
        method: 'get',
    },
    /**
     * Replace the snapshot interface below, added in 20181108
     */
    getTraceList: {
        path: productPrefix + '/getTraceList',
        method: 'post',
    },
    /** The following are the new interfaces in version 20180531 **/
    /**
     * Snapshot
     */
    snapshot: {
        path: `${productPrefix}/snapshotList`,
        method: 'post',
    },
    /**
     * Get the description of the business request display item
     */
    businessTransactionDescription: {
        path: `${productPrefix}/getBusinessTransactionDescriptionList`,
        method: 'get',
    },
    /**
     * Business request
     */
    businessTransaction: {
        path: `${productPrefix}/businessTransactionList`,
        method: 'post',
    },
    /**
     * All requests
     */
    serviceEndpoint: {
        path: `${productPrefix}/serviceEndpointList`,
        method: 'post',
    },
    /**
     * All services
     */
    services: {
        path: `${productPrefix}/services`,
        method: 'post',
    },
    /**
     * All services and nodes
     */
    nodes: {
        path: `${productPrefix}/nodes`,
        method: 'post',
        // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    /**
     * Get user agent
     */
    getAgent: {
        path: `/apm/redirect/api/v1/napm/userGuide/javaAgentConfig`,
        method: 'get',
    },
    createProduct: {
        path: `${prefixV1Products}/createProduct`,
        method: 'post',
    },
    // The tenantId in deleteProduct and updateProduct passes the tenantId returned from the getProducts list.
    deleteProduct: {
        path: `/apm/redirect/api/v1/products/{tenantId}/deleteProduct/{productId}`,
        method: 'delete',
    },
    updateProduct: {
        path: `/apm/redirect/api/v1/products/{tenantId}/updateProduct/{productId}`,
        method: 'post',
    },
    trans: {
        path: `${prefix}/transactions/{transId}`,
        method: 'get',
    },
    /**
     * Data report
     */
    loadsReport: {
        path: `${prefixV1}/{productId}/describeDataReportInfos`,
        method: 'get',
    },
    updateReport: {
        path: `${prefixV1}/{productId}/updateDataReportInfo/{id}`,
        method: 'put',
    },
    deleteReport: {
        path: `${prefixV1}/{productId}/deleteDataReportInfo/{id}`,
        method: 'delete',
    },
    addReport: {
        path: `${prefixV1}/{productId}/addDataReportInfo`,
        method: 'post',
    },
    sendReport: {
        path: `${prefixV1}/{productId}/sendDataReportNow/{id}`,
        method: 'get',
    },
    getDeployType: {
        path: '/apm/redirect/api/v1/deployInfo/deployType',
        method: 'get',
    },
};
