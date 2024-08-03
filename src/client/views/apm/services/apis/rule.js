import { prefixV1, prefix } from '../base.js';

export default {
    /**
     * Get a list of error rules
     */
    errorRules: {
        path: prefixV1 + '/errorRules',
        method: 'get',
    },
    /**
     * Create an error rule
     */
    createRules: {
        path: prefixV1 + '/{type}Rules', // exceptionRules,httpStatusCodeRules,logRules
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    /**
     * Modify error rules
     */
    modifyRules: {
        path: prefixV1 + '/{type}Rules/{ruleId}',
        method: 'put',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    /**
     * Delete error rule
     */
    deleteRules: {
        path: prefixV1 + '/{type}Rules/{ruleId}',
        method: 'delete',
    },
};
