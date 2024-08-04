import {
    toPlainObject as toConfigPlainObject,
} from '../base/config';

import { getFromModel } from '../base/utils';

export function toPlainObject(model) {
    const obj = toConfigPlainObject(model);
    const g = getFromModel(model);
    return {
        ...obj,
        names: g('spec.names'), // name
        group: g('spec.group'), // group
        versions: (g('spec.versions') || []).map(v => v.name), // version
    };
}
