import { CLUSTER_STATUS_MAP, NODE_TYPE_MAP, NODE_STATUS_MAP, USER_ROLE_MAP } from './map';
import _ from 'lodash';
import { unit } from '@micro-app/common/filters';

export const ignoredKeys = [ 'system', 'kubernetes.io', 'beta.kubernetes.io' ];

export default {
    clusterStatus(status) {
        return CLUSTER_STATUS_MAP[status] || '-';
    },
    formatLabels(labels) {
        if (!labels) { return []; }
        return labels.map(label => `${label.key}: ${label.value}`);
    },
    obj2Array(obj) {
        if (_.isEmpty(obj)) { return []; }
        return Object.keys(obj)
            .sort()
            .map(key => ({ key, value: obj[key] }));
    },
    Ki2Gi(kiString) {
        return Math.round(+kiString.replace('Ki', '') / 1024 / 1024);
    },
    getNodeType(labels) {
        // Three shared labels need to be marked: system/tenantid: kubeworkz.share, system/status: assigned, system/namespace: kubeworkz.share
        const type = labels['system/tenant'] === 'kubeworkz.share' ? labels['system/tenant'] : labels['system/status'];
        return NODE_TYPE_MAP[type] || '-';
    },
    getNodeStatus(node) {
        const { spec, status: { conditions } } = node;
        if (spec.unschedulable) { return NODE_STATUS_MAP.unschedulable; } else if ((conditions.find(cond => cond.type === 'Ready') || {}).status === 'True') { return NODE_STATUS_MAP.normal; }
        return NODE_STATUS_MAP.abnormal;
    },
    checkSchedulable(spec) {
        const { unschedulable } = spec;
        return unschedulable ? 'Unschedulable' : 'Scheduling';
    },
    isNodeAssigned(node) {
        return node.metadata.labels['system/status'] === 'assigned';
    },
    getNodesStat(nodes) {
        return nodes.reduce((acc, node) => {
            const { cpu, memory } = node.value.status.capacity;
            const gpu = +node.value.status.capacity['nvidia.com/gpu'] || 0;
            acc.totalCpu += +cpu;
            acc.totalMem += this.Ki2Gi(memory);
            acc.totalGPU += gpu;
            return acc;
        }, { totalCpu: 0, totalMem: 0, totalGPU: 0 });
    },
    formatRole(role) {
        return USER_ROLE_MAP[role];
    },
    num(value) {
        const tmp = unit.size(value, 'B');
        // Keep to two decimal places
        // Return objects: unit and num
        return {
            num: tmp.num[0] ? tmp.num[0].toFixed(2) : 0,
            unit: tmp.unit[0],
        };
    },
};
