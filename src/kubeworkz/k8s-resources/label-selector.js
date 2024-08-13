import {
    getFromModel,
    toObjectArray,
} from './base';

export const toPlainObject = (model = 'normal') => {
    const g = getFromModel(model);
    const obj = {
        matchLabels: toObjectArray(g('selector.matchLabels', {}), 'key', 'value'),
    };
    return obj;
};


export const toK8SObject = model => {};
