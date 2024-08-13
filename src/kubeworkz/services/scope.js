import Service from './service';
import { userInterceptor } from './interceptor';
// const controlCluster = 'pivot-cluster';
import store from 'kubeworkz/store';
const service = Service({
    baseURL: `/api/v1/kube/proxy/clusters/${store.get('scope/controlClusterList')[0].clusterName}`,
    apis: {
        getScopeList: {
            template: '/apis/tenant.kubeworkz.io/v1/{scope}',
            method: 'get',
        },
        createScope: {
            template: '/apis/tenant.kubeworkz.io/v1/{scope}',
            method: 'post',
        },
        patchScope: {
            template: '/apis/tenant.kubeworkz.io/v1/{scope}/{name}',
            method: 'patch',
            headers: {
                'Content-Type': 'application/merge-patch+json',
            },
        },
        getScope: {
            template: '/apis/tenant.kubeworkz.io/v1/{scope}/{name}',
            method: 'post',
        },
        deleteScope: {
            template: '/apis/tenant.kubeworkz.io/v1/{scope}/{name}',
            method: 'delete',
        },
        createKubeQuotaResource: {
            method: 'post',
            url: '/apis/quota.kubeworkz.io/v1/kuberesourcequota',
        },
        getKubeQuotaResource: {
            method: 'get',
            url: '/apis/quota.kubeworkz.io/v1/kuberesourcequota',
        },
        getKubeQuotaResourceInstance: {
            method: 'get',
            template: '/apis/quota.kubeworkz.io/v1/kuberesourcequota/{name}',
            silent: true,
        },
        patchKubeDefineResource: {
            method: 'patch',
            template: '/apis/quota.kubeworkz.io/v1/kuberesourcequota/{name}',
            headers: {
                'Content-Type': 'application/merge-patch+json',
            },
        },
    },
});

userInterceptor(service.axiosInstance);
export default service;
