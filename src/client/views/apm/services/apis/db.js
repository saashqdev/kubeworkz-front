const prefix = '/apm/redirect/api/v1/products/{tenantId}/{productId}';
const prefixV2 = '/apm/redirect/api/v2/products/{tenantId}/{productId}';
export default {
    /**
     * Database list interface
     */
    getDbs: {
        path: prefix + '/dbOverview',
        method: 'get',
    },
    /**
     * Slow SQL query interface
     */
    getSlowSql: {
        path: prefixV2 + '/slowSqlOverview',
        method: 'get',
    },
    /**
     *  Slow SQL details scatter plot interface
     */
    getSlowSqlDetail: {
        path: prefixV2 + '/slowSqlScatterPlot',
        method: 'post',
    },
};
