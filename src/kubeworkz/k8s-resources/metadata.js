import {
    omitBy,
    isEmpty,
    zipObjectDeep,
    omit,
} from 'lodash';
import {
    getFromModel,
    toObjectArray,
    KVtoObject,
} from './base';
import { ignoredKeys } from 'kubeworkz/utils/constants';

export const toPlainObject = (model, mode = 'normal') => {
    const g = getFromModel(model);
    const obj = {
        name: g('metadata.name'), // name
        clusterName: g('metadata.clusterName'), // Cluster name
        namespace: g('metadata.namespace'), // namespace
        annotations: toObjectArray(g('metadata.annotations', {}), 'key', 'value'), // annotations
        labels: toObjectArray(g('metadata.labels', {}), 'key', 'value').map(i => ({ // label
            ...i,
            disabled: ignoredKeys.some(k => i.key.startsWith(k)),
        })).sort(a => (a.disabled ? -1 : 1)),
        pureLabels: g('metadata.labels', {}), // original tag
        resourceVersion: g('metadata.resourceVersion'), // Resource version
        creationTimestamp: g('metadata.creationTimestamp'), // creation time
        deletionTimestamp: g('metadata.deletionTimestamp'), // Delete time
        ownerReferences: g('metadata.ownerReferences'), // Owner information
        uid: g('metadata.uid'), // uid
    };
    if (mode === 'noEmpty') {
        return omitBy(obj, v => isEmpty(v) || !v);
    }
    return obj;
};

const effectKeys = [
    'name',
    'annotations',
    'labels',
];
export const toK8SObject = model => {
    const g = getFromModel(model);
    return omitBy(zipObjectDeep(effectKeys, [
        g('metadata.name'),
        KVtoObject(g('metadata.annotations'), 'key', 'value'),
        {
            ...KVtoObject(g('metadata.labels'), 'key', 'value'),
            // 'kubeworkz.io/app': g('metadata.name'),
        },
        // TODO NSF tag injection
    ]), v => !v);
};

export function toPatchObject(model) {
    const pureSourceMetadata = model.metadata;
    const newK8SSpecObject = toK8SObject(model);
    const remains = omit(pureSourceMetadata, effectKeys);
    return Object.assign({}, remains, newK8SSpecObject);
}

export function toModifyObject(model) {
    const pureSourceMetadata = model.puresource.metadata;
    const newK8SSpecObject = toK8SObject(model);
    const remains = omit(pureSourceMetadata, effectKeys);
    return Object.assign({}, remains, newK8SSpecObject);
}
