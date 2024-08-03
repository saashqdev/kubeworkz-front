import { prefixV1, prefix } from '../base.js';
const productPrefix = prefix + '/{product}';
export default {
    /** The following are the new interfaces in version 20180531 **/
    topo: {
        path: `${productPrefix}/productFlowMap`,
        method: 'post',
    },
    serviceTopo: {
        path: `${productPrefix}/serviceFlowMap/{service}`,
        method: 'post',
    },
    /**
     * All Nodes - Monitoring Chart Description
     */
    chartList: {
        path: `${productPrefix}/getMetricChartDescriptionList`,
        method: 'get',
    },
    /**
     * All Nodes - Monitoring Chart
     */
    metricData: {
        path: `${productPrefix}/getMetricData`,
        method: 'post',
    },
    descriptionList: {
        path: `${productPrefix}/getHeapStatus`,
        method: 'post',
    },
    getMonitorData: {
        path: `${prefixV1}/metricData`,
        method: 'get',
    },
};
