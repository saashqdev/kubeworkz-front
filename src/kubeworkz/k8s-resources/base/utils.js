import { get, keys, zipObject, unset, set } from 'lodash';

export const getFromModel = model => { // Encapsulate the get function
    return (path, _default = undefined) => get(model, path, _default);
};
export const toObjectArray = (obj, labelStr, valueStr) => { // Object to array { field1: 'a', field2: 'b'} -> [{ key: 'field1', value: 'a' }, { key: 'field2', value: 'b' }]
    return keys(obj).map(k => ({ [labelStr]: k, [valueStr]: obj[k] }));
};
export const KVtoObject = (target = [], key, value) => { // //Array to object [{ key: 'field1', value: 'a' }, { key: 'field2', value: 'b' }] -> { field1: 'a', field2: 'b'}
    const existLabels = target.filter(i => i[key]);
    return zipObject(
        existLabels.map(l => l[key]),
        existLabels.map(l => l[value])
    );
};
export const isFilledObject = obj => {
    return Object.values(obj).every(v => v === 0 || !!v);
};

export const genReset = (target, newObject) => {
    return path => {
        if (!get(newObject, path) && get(newObject, path) !== 0) {
            unset(target, path);
        } else {
            set(target, path, get(newObject, path));
        }
    };
};
