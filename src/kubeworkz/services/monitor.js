// import axios from 'axios';
// import { userInterceptor } from './interceptor';

// const clusterService = axios.create({
//     baseURL: '/api/v1/kube/clusters',
//     timeout: 10000,
// });
// userInterceptor(clusterService);
// export async function getClusters(){
//     return await clusterService.request({
//         url: '/info',
//         method: 'get',
//     });
// }

import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: '/api/v1',
    apis: {
        getInnerDashboards: {
            method: 'get',
            template: '/kube/proxy/clusters/{cluster}/apis/monitoring.kubeworkz.io/v1/namespaces/kube-public/dashboards/{resource}',
        },
        getInnerDashboardByQuery: {
            method: 'get',
            template: '/kube/proxy/clusters/{cluster}/apis/monitoring.kubeworkz.io/v1/namespaces/kubeworkz-monitoring/dashboards',
        },
        // getPodDashboards: {
        //     method: 'get',
        //     url: '/kube/proxy/clusters/pivot-cluster/apis/monitoring.kubeworkz.io/v1/namespaces/kube-public/dashboards/kube-pod-resource',
        // },
        getVariableLabel: {
            method: 'get',
            template: '/label/{label}/values',
        },
        getVariableSeries: {
            method: 'get',
            url: '/series',
        },
        queryRange: {
            method: 'get',
            url: '/query_range',
        },
        queryInstant: {
            method: 'get',
            url: '/query',
        },
    },
});

userInterceptor(service.axiosInstance);
export default service;
