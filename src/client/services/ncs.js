import Service from './service.js';
import { normalizeConfigMap, normalizeSecret, normalizeService } from '@micro-app/common/views/ncs/utils';

const harborapis = {
    // type - type, 1 public 2 private 3 all
    loadImages: {
        path: '/{clusterId}/projects/getImageLists',
        method: 'get',
        process: (result = {}) => ({
            list: result.repositories || [],
            total: result.total || 0,
            harbor: result.harbor || '',
        }),
    },
    // Get mirror list
    loadRepoTags: {
        path: '/{clusterId}/repositories/getRepoTags',
        method: 'get',
    },
};
const ncsapis = {
    loadSecrets: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/secrets',
        process: result =>
            // Do not expose secrets of this type kubernetes.io/service-account-token
            (result.items || [])
                .filter(item => item.type !== 'kubernetes.io/service-account-token')
                .map(item => normalizeSecret(item))
        ,
    },
    loadConfigMap: {
        method: 'get',
        path: '/clusters/{clusterId}/namespaces/{namespace}/configmaps',
        process: result => (result.items || []).map(item => normalizeConfigMap(item)),
    },
    loadServices: {
        method: 'get',
        path: '/extends/clusters/{clusterId}/namespaces/{namespace}/services',
        process: result => {
            return {
                total: result.total || 0,
                list: (result.services || []).map(item => normalizeService(item)),
            };
        },
    },
    loadAllInfo: {
        method: 'get',
        path: '/extends/monitor/query',
        process: result => result.data,
    },
};

const clusterapis = {
    // A new management and control cluster has been added. Most of the places where the cluster list was previously called cannot display the management and control cluster, so the return of this method is filtered.
    loadSimple: {
        method: 'get',
        path: '/clusters/prune',
        process: (result = {}) => {
            const clusterInfoList = result.clusterInfoList || [];
            return {
                clusterInfoList: clusterInfoList.filter(item => !item.isControlCluster),
            };
        },
    },
    loadSimpleAll: {
        method: 'get',
        path: '/clusters/prune',
    },
};

const harbor = new Service(harborapis, '/repo/proxy/api/v1/harborproxy');
const ncs = new Service(ncsapis, '/ncs/proxy/api/v1/ncs');
const cluster = new Service(clusterapis, '/ncs/proxy/api/v1/ncs/extends');
const service = Object.assign(harbor, ncs, cluster);
export default service;
