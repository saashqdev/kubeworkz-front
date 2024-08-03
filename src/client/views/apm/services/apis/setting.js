const prefixV2 = '/apm/redirect/api/v2/products/{tenantId}/{productId}';
export default {
    /**
     * Slow response threshold setting (modification) interface
     */
    setStaticGradingRule: {
        path: prefixV2 + '/staticGradingRule',
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        dataType: 'form',
    },
    /**
     * Slow response threshold reading interface
     */
    getStaticGradingRule: {
        path: prefixV2 + '/staticGradingRule',
        method: 'get',
    },
    /**
     * Slow SQL threshold setting (modification) interface (modification) interface
     */
    setSlowSqlRule: {
        path: prefixV2 + '/slowSqlRule',
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        dataType: 'form',
    },
    /**
     * Slow response threshold reading interface
     */
    getSlowSqlRule: {
        path: prefixV2 + '/slowSqlRule',
        method: 'get',
    },
    /**
     * Add log information interface
     * @param String kibanaEntrypoint  kibana domain name or ip
     * @param String indexPattern   kibana indexPattern
     */
    addKibanaInfo: {
        path: prefixV2 + '/addKibanaInfo',
        method: 'post',
    },
    /**
     * Update log information interface
     */
    updateKibanaInfo: {
        path: prefixV2 + '/updateKibanaInfo',
        method: 'get',
    },
    /**
     * Query log information interface
     */
    getKibanaInfo: {
        path: prefixV2 + '/getKibanaInfo',
        method: 'get',
    },
    getSamplingRate: {
        path: prefixV2 + '/samplingRate',
        method: 'get',
    },
    setSamplingRate: {
        path: prefixV2 + '/samplingRate',
        method: 'post',
    },
    getCustomId: {
        path: prefixV2 + '/customId',
        method: 'get',
    },
    setCustomId: {
        path: prefixV2 + '/customId',
        method: 'post',
    },
    /**
     * Custom method
     */
    createCustomMethod: {
        path: prefixV2 + '/createCustomMethod',
        method: 'post',
    },
    updateCustomMethod: {
        path: prefixV2 + '/updateCustomMethod',
        method: 'post',
    },
    getCustomMethods: {
        path: prefixV2 + '/getCustomMethodList',
        method: 'get',
    },
    deleteCustomMethod: {
        path: prefixV2 + '/deleteCustomMethod',
        method: 'delete',
    },
};
