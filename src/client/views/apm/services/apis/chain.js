import { prefixV1, prefix } from '../base.js';
export default {
    /**
     * Get an overview of monitoring data under space
     */
    search: {
        path: prefixV1 + '/transactionOverviews/{traceId}',
        method: 'get',
    },
    callChain: {
        path: prefixV1 + '/callTree/{transId}',
        method: 'get',
    }
};