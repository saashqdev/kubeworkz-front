import { get as getFun, set as setFun } from 'lodash';
import {
    toPlainObject as toConfigPlainObject,
    toK8SObject as toConfigK8SObject,
    toPatchObject as toPatchConfigObject,
} from '../base/config';
import {
    toObjectArray,
    KVtoObject,
} from '../base/utils';
import { getFromModel } from '../base/utils';

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        type: g('type', 'Opaque'), //
        data: toObjectArray(g('data') || {}, 'key', 'value'), // data key-value
        isJoinImage: !!g('metadata.annotations["kubeworkz.io/image"]', null),
        joinImage: g('metadata.annotations["kubeworkz.io/image"]', ''),
    };
}

export function toK8SObject(model) {
    const g = getFromModel(model);
    const obj = toConfigK8SObject(
        'v1',
        'ConfigMap',
        model
    );
    const data = KVtoObject(g('data').map(item => {
        return {
            key: item.key,
            value: item.value ? item.value.replaceAll('\r', '') : item.value,
        };
    }), 'key', 'value'); // data key-value
    const annotations = getFun(obj, 'metadata.annotations', {});
    if (model.isJoinImage && model.joinImage) {
        annotations['kubeworkz.io/image'] = model.joinImage;
    } else {
        delete annotations['kubeworkz.io/image'];
    }
    setFun(obj, 'metadata.annotations', annotations);
    return {
        ...obj,
        data,
    };
}

export function patchK8SObject(model) {
    const obj = toPatchConfigObject(model);
    const annotations = getFun(obj, 'metadata.annotations', {});
    if (model.isJoinImage && model.joinImage) {
        annotations['kubeworkz.io/image'] = model.joinImage;
    } else {
        delete annotations['kubeworkz.io/image'];
    }
    setFun(obj, 'metadata.annotations', annotations);
    const g = getFromModel(model);
    return {
        ...obj,
        data: KVtoObject(g('data').map(item => {
            return {
                key: item.key,
                value: item.value ? item.value.replaceAll('\r', '') : item.value,
            };
        }), 'key', 'value'), // data key-value
    };
}
