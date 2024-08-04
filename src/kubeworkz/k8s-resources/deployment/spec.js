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
    const maxSurge = g('spec.strategy.rollingUpdate.maxSurge'); // Maximum number of copies beyond expectations
    const maxUnavailable = g('spec.strategy.rollingUpdate.maxUnavailable'); // Maximum number of unusable copies
    const strategy = {
        type: g('spec.strategy.type'), // Update type
        enable: !!(minReadySeconds || maxSurge || maxUnavailable),
        minReadySeconds, // Minimum ready time
        maxSurge, // Maximum number of copies beyond expectations
        maxUnavailable, // Maximum number of unusable copies
    };
    return {
        // progressDeadlineSeconds: g('spec.progressDeadlineSeconds'),
        replicas: g('spec.replicas', 1), // Number of replicas
        ...toSelectorPlainObject(g('spec')), // The selector field defines how the Deployment finds the Pods to be managed.
        strategy, // update strategy
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    const obj = {
        replicas: toNumber(g('spec.replicas')), // Number of replicas
    };
    const minReadySeconds = toNumber(g('spec.strategy.minReadySeconds')); // Minimum ready time
    const maxSurge = `${g('spec.strategy.maxSurge')}`.endsWith('%') ? g('spec.strategy.maxSurge') : toNumber(g('spec.strategy.maxSurge')); // Maximum number of copies beyond expectations
    const maxUnavailable = `${g('spec.strategy.maxUnavailable')}`.endsWith('%') ? g('spec.strategy.maxUnavailable') : toNumber(g('spec.strategy.maxUnavailable')); // Maximum number of unusable copies
    if (minReadySeconds || minReadySeconds === 0 || maxSurge || maxSurge === 0 || maxUnavailable || maxUnavailable === 0) {
        obj.strategy = {
            rollingUpdate: {
                type: 'RollingUpdate', // Update type
            },
        };

        if (minReadySeconds || minReadySeconds === 0) {
            obj.minReadySeconds = minReadySeconds;
        }
        if (maxSurge || maxSurge === 0) {
            obj.strategy.rollingUpdate.maxSurge = maxSurge;
        }
        if (maxUnavailable || maxUnavailable === 0) {
            obj.strategy.rollingUpdate.maxUnavailable = maxUnavailable;
        }
    }
    return obj;
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.replicas'); // Number of replicas
    resetProperty('spec.minReadySeconds'); // Minimum ready time
    resetProperty('spec.strategy.rollingUpdate.maxSurge'); // Maximum number of copies beyond expectations
    resetProperty('spec.strategy.rollingUpdate.maxUnavailable'); // Maximum number of unusable copies
};
