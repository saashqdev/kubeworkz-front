import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: '/api/v1/kube/proxy/clusters',
    apis: {
        getNamespaces: {
            template: '/{cluster}/api/v1/namespaces',
            method: 'get',
        }
    }
});

userInterceptor(service.axiosInstance);
export default service;