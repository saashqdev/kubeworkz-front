import Service from './service';
import { userInterceptor } from './interceptor';

const service = Service({
    baseURL: 'api/v1/kube/extend',
    apis: {
        getResources: {
            method: 'get',
            template: '/{resource}',
        },
    },

});

userInterceptor(service.axiosInstance);
export default service;
