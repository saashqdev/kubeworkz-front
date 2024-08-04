import {
    getFromModel,
} from '../base';

export const toPlainObject = model => {
    const cg = getFromModel(model);
    return {
        desired: cg('spec.replicas', 0), // expected number of copies
        updated: cg('status.updatedReplicas', 0), // The number of copies that are already the latest version
        available: cg('status.availableReplicas', 0), // Number of available copies
        unavailable: cg('status.unavailableReplicas', 0), // Number of unusable copies
        total: cg('status.replicas', 0), // Total number of copies
        conditions: cg('status.conditions', []), // status entry
        readyReplicas: cg('status.readyReplicas', 0), // ready copy
    };
};
