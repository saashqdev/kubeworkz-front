import { get } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
} from '../base/config';

import { getFromModel } from '../base/utils';
import {
    unitConvertMemory,
    unitConvertCPU,
} from 'kubeworkz/utils/functional';

const defaultHard = {
    requestsCpu: '', // request cpu
    limitsCpu: '', // upper limit cpu
    requestsMemory: '', // Request memory
    limitsMemory: '', // Upper limit memory
    requestsNvidiaGpu: '', // Request gpu
    requestsStorage: '', // Request storage
};
export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    const hard = {
        limitsCpu: g('spec.hard["limits.cpu"]') ? unitConvertCPU(g('spec.hard["limits.cpu"]')) : 0, // request cpu
        requestsCpu: g('spec.hard["requests.cpu"]') ? unitConvertCPU(g('spec.hard["requests.cpu"]')) : 0, // upper limit cpu
        limitsMemory: g('spec.hard["limits.memory"]') ? unitConvertMemory(g('spec.hard["limits.memory"]')) : 0, // Request memory
        requestsMemory: g('spec.hard["requests.memory"]') ? unitConvertMemory(g('spec.hard["requests.memory"]')) : 0, // Upper limit memory
        requestsNvidiaGpu: g('spec.hard["requests.nvidia.com/gpu"]') ? unitConvertCPU(g('spec.hard["requests.nvidia.com/gpu"]')) : 0, // Request gpu
        requestsStorage: g('spec.hard["requests.storage"]') ? unitConvertMemory(g('spec.hard["requests.storage"]'), 'Gi') : 0, // Request storage
    };
    return {
        ...obj,
        spec: {
            hard: Object.assign({}, defaultHard, hard),
            target: g('spec.target'),
        },
        status: {
            hard: { // total quota
                cpu: g('status.hard["requests.cpu"]') ? unitConvertCPU(g('status.hard["requests.cpu"]')) : 0,
                limitsCpu: g('status.hard["limits.cpu"]') ? unitConvertCPU(g('status.hard["limits.cpu"]')) : 0,
                memory: g('status.hard["requests.memory"]') ? unitConvertMemory(g('status.hard["requests.memory"]')) : 0,
                limitsMemory: g('status.hard["limits.memory"]') ? unitConvertMemory(g('status.hard["limits.memory"]')) : 0,
                gpu: g('status.hard["requests.nvidia.com/gpu"]') ? unitConvertCPU(g('status.hard["requests.nvidia.com/gpu"]')) : 0,
                storage: g('status.hard["requests.storage"]') ? unitConvertMemory(g('status.hard["requests.storage"]'), 'Gi') : 0,
            },
            used: { // Quota used
                cpu: g('status.used["requests.cpu"]') ? unitConvertCPU(g('status.used["requests.cpu"]')) : 0,
                limitsCpu: g('status.used["limits.cpu"]') ? unitConvertCPU(g('status.used["limits.cpu"]')) : 0,
                memory: g('status.used["requests.memory"]') ? unitConvertMemory(g('status.used["requests.memory"]')) : 0,
                limitsMemory: g('status.used["limits.memory"]') ? unitConvertMemory(g('status.used["limits.memory"]')) : 0,
                gpu: g('status.used["requests.nvidia.com/gpu"]') ? unitConvertMemory(g('status.used["requests.nvidia.com/gpu"]')) : 0,
                storage: g('status.used["requests.storage"]') ? unitConvertMemory(g('status.used["requests.storage"]'), 'Gi') : 0,
            },
        },
        requestsMemory: '',
        limitsMemory: '',
    };
}

export function toK8SObject(model, tenant, clusterName) {
    const g = getFromModel(model);
    const obj = {
        apiVersion: 'quota.kubeworkz.io/v1',
        kind: 'CubeResourceQuota',
        metadata: {
            name: `${clusterName}.${tenant}`, // name
            labels: {
                'kubeworkz.io/cluster': clusterName, // Cluster name
                'kubeworkz.io/tenant': tenant, // Tenant name
            },
            annotations: {
                'kubeworkz.io/sync': 'true',
            },
        },
        spec: {
            hard: { // total quota
                'requests.cpu': g('spec.hard["requestsCpu"]'),
                'limits.cpu': g('spec.hard["limitsCpu"]'),
                'requests.memory': g('spec.hard["requestsMemory"]') + 'Mi',
                'limits.memory': g('spec.hard["limitsMemory"]') + 'Mi',
                'requests.nvidia.com/gpu': g('spec.hard["requestsNvidiaGpu"]') || 0,
                'requests.storage': g('spec.hard["requestsStorage"]') + 'Gi',
            },
            target: {
                name: tenant,
                kind: 'Tenant',
            },
        },
    };

    return {
        ...obj,
    };
}

export function patchK8SObject(model) {
    const obj = toK8SObject(model);
    return {
        spec: {
            hard: get(obj, 'spec.hard'),
        },

    };
}
