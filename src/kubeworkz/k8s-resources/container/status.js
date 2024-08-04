import {
    getFromModel,
} from '../base';

export const toPlainObject = (model, containerName) => {
    const cg = getFromModel(model);
    const containerStatus = (cg('status.containerStatuses', []) || []); // Business container status information
    const initContainerStatuses = (cg('status.initContainerStatuses', []) || []); // init container status information

    return [ ...containerStatus, ...initContainerStatuses ].find(c => c.name === containerName) || { state: { unknown: {} } };
};
