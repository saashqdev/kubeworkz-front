import {
    pickBy,
    isObjectLike,
    toNumber,
} from 'lodash';
import {
    getFromModel,
    toObjectArray,
    genReset,
} from '../base/utils';

export const toPlainObject = (model, containers, podTemplate) => {
    const g = getFromModel(model);
    if (!g('spec.template.spec.restartPolicy')) { // Restart strategy
        podTemplate.spec.restartPolicy = 'OnFailure';
    }

    return {
        ...pickBy(g('spec'), v => !isObjectLike(v)),
        completions: g('spec.completions', 1), // Expected number of successful executions
        parallelism: g('spec.parallelism', 1), // Parallel number
        activeDeadlineSeconds: g('spec.activeDeadlineSeconds'), // overtime time
        backoffLimit: g('spec.backoffLimit', 6), // number of retries
        matchLabels: toObjectArray(g('spec.selector.matchLabels', {}), 'key', 'value'),
    };
};

export const toK8SObject = model => {
    const g = getFromModel(model);
    const obj = {
        completions: toNumber(g('spec.completions')), // Expected number of successful executions
        parallelism: toNumber(g('spec.parallelism')), // Parallel number
        backoffLimit: toNumber(g('spec.backoffLimit')), // number of retries
        selector: {},
    };
    const activeDeadlineSeconds = g('spec.activeDeadlineSeconds'); // overtime time
    if (activeDeadlineSeconds) {
        obj.activeDeadlineSeconds = toNumber(activeDeadlineSeconds);
    }
    return obj;
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.completions');
    resetProperty('spec.parallelism');
    resetProperty('spec.backoffLimit');
    resetProperty('spec.activeDeadlineSeconds');
};
