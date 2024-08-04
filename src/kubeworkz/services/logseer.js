import Service from './service';

import { userInterceptor } from './interceptor';
const v1Profix = '/api/v1/logseer/extends';
const v2Profix = '/api/v2/logseer/extends';
const logseerService = Service({
    baseURL: '',
    apis: {
        getLogconfigList: {
            method: 'get',
            template: `${v2Profix}/logconfigs`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        createLogconfig: {
            method: 'post',
            template: `${v2Profix}/clusters/{cluster}/namespaces/{namespace}/logconfigs`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        getLogconfigInstance: {
            method: 'get',
            template: `${v2Profix}/clusters/{cluster}/namespaces/{namespace}/logconfigs/{name}`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        updateLogconfig: {
            method: 'put',
            template: `${v2Profix}/clusters/{cluster}/namespaces/{namespace}/logconfigs/{name}`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        deleteLogconfig: {
            method: 'delete',
            template: `${v2Profix}/clusters/{cluster}/namespaces/{namespace}/logconfigs/{name}`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },


        labelSelectorKeys: {
            method: 'get',
            url: `${v1Profix}/labelSelectorKey`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        elasticSearch: {
            method: 'post',
            url: `${v1Profix}/elasticsearch/_search`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        availableFields: {
            method: 'get',
            url: `${v1Profix}/elasticsearch/availableFields`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        suggestions: {
            method: 'post',
            url: `${v1Profix}/elasticsearch/suggestions`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
        /**
        size: number, optional, default 5, indicating the number of items returned by the query

        search_after: timestamp, which timestamp to start returning from

        sort: sort

        timestamp: required, string, can be asc or desc, sorted by timestamp
        range: query range

        timestamp: time range

        gte: number, greater than or equal to a certain time point, unix timestamp, milliseconds
        lte: number, less than or equal to a certain time point, unix timestamp, milliseconds
        If the page is turned up, the anchor log timestamp is the timestamp of the same time on the next day; if the page is turned down, the anchor log timestamp is the timestamp of the same time on the previous day.
    */
        elasticContext: {
            method: 'post',
            url: `${v1Profix}/elasticsearch/query`,
            headers: {
                'x-auth-accountId': 0,
                'x-auth-projectId': 0,
                'x-auth-tenantId': 0,
            },
        },
    },
});

userInterceptor(logseerService.axiosInstance);

export default logseerService;
