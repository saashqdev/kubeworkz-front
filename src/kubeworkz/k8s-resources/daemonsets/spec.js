import {
    toNumber,
} from 'lodash';
import {
    getFromModel,
    genReset,
} from '../base/utils';
import {
    toPlainObject as toSelectorPlainObject,
} from '../label-selector';

export const toPlainObject = model => {
    const g = getFromModel(model);
    const minReadySeconds = g('spec.minReadySeconds'); // Minimum ready time
    const maxSurge = g('spec.updateStrategy.rollingUpdate.maxSurge'); // Maximum number of copies beyond expectations
    const maxUnavailable = g('spec.updateStrategy.rollingUpdate.maxUnavailable'); // Maximum number of unusable copies
    const strategy = { // Pod update strategy
        type: g('spec.updateStrategy.type'),
        enable: !!(minReadySeconds || maxSurge || maxUnavailable),
        minReadySeconds,
        maxSurge,
        maxUnavailable,
    };
    const tenant = g('metadata.labels["system/tenant"]') || 'kubeworkz.share';
    return {
        ...toSelectorPlainObject(g('spec')),
        strategy,
        level: { // level
            ind: tenant === 'kubeworkz.share' ? 'platform' : 'tenant',
            tenant,
        },
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    const obj = {};
    const minReadySeconds = toNumber(g('spec.strategy.minReadySeconds'));  // Minimum ready time
    const maxSurge = toNumber(g('spec.strategy.maxSurge')); // Maximum number of copies beyond expectations
    const maxUnavailable = toNumber(g('spec.strategy.maxUnavailable')); // Maximum number of unusable copies
    if (minReadySeconds || minReadySeconds === 0 || maxSurge || maxUnavailable) {
        obj.updateStrategy = {
            rollingUpdate: {
                type: 'RollingUpdate',
            },
        };

        if (minReadySeconds || minReadySeconds === 0) {
            obj.minReadySeconds = minReadySeconds;
        }
        if (maxSurge) {
            obj.updateStrategy.rollingUpdate.maxSurge = maxSurge;
        }
        if (maxUnavailable) {
            obj.updateStrategy.rollingUpdate.maxUnavailable = maxUnavailable;
        }
    }
    return obj;
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.replicas');
    resetProperty('spec.minReadySeconds');
    resetProperty('spec.strategy.rollingUpdate.maxSurge');
    resetProperty('spec.strategy.rollingUpdate.maxUnavailable');
};
