import {
    toPlainObject as toCommonPlainObject,
} from '../base/common';
import { getFromModel } from '../base/utils';
import { NODE_STATUS_MAP } from 'kubeworkz/utils/constance';

export function toPlainObject(model) {
    const g = getFromModel(model);
    return toCommonPlainObject(model)({
        toSpecPlainObject() {
            const labels = g('metadata.labels') || {};
            // const type = labels['system/tenant'] === 'netease.share' ? labels['system/tenant'] : labels['system/status'];
            /*
                “Share": "node.kubeworkz.io/status"="assigned" and "node.kubeworkz.io/tenant"="share" exist in the tag"
                “Exclusive”:
                ​		"node.kubeworkz.io/status"="unassigned" exists in the label
                ​		"node.kubeworkz.io/status"="assigned" exists in the label and the value of "node.kubeworkz.io/tenant" is not equal to "share"
             */
            let type = '-';
            if (labels['node.kubeworkz.io/status'] === 'assigned' && labels['node.kubeworkz.io/tenant'] === 'share') {
                type = 'shared';
            } else if (labels['node.kubeworkz.io/status'] === 'unassigned' || (labels['node.kubeworkz.io/status'] === 'assigned' && labels['node.kubeworkz.io/tenant'] !== 'share')) {
                type = 'exclusive';
            }
            const mixed = labels['colocation.netease.com/node-pool'] === 'colocation';
            return {
                ...g('spec'),
                type,
                mixed,
            };
        },
        toStatusPlainObject() {
            const addresses = g('status.addresses') || [];
            const p = addresses.find(addr => addr.type === 'InternalIP');
            const conditions = g('status.conditions') || [];
            const unschedulable = g('spec.unschedulable');
            let statusText = '';
            if (model.extendInfo) {
                statusText = model.extendInfo.status;
            } else {
                statusText = unschedulable ?
                    NODE_STATUS_MAP.unschedulable :
                    conditions.find(cond => cond.type === 'Ready' && cond.status === 'True') ?
                        NODE_STATUS_MAP.normal :
                        NODE_STATUS_MAP.abnormal;
            }
            return {
                nodeIP: (p || {}).address || '',
                ...g('status'),
                statusText,
            };
        },
    });
}
