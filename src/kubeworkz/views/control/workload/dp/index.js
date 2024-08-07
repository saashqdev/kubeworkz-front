import workloadService from 'kubeworkz/services/k8s-resource';
import { toPlainObject as toDeploymentPlainObject } from 'kubeworkz/k8s-resources/deployment';

const filters = {
    status(status) {
        return `${status.desired} desired, ${status.updated} updated, ${status.available} available, ${status.unavailable} unavailable, ${status.total} total`;
    },
};

const listColumns = [
    { title: 'Name', name: 'name', sortable: true },
    { title: 'Status', name: 'status', width: '320px' },
    { title: 'Creation time', name: 'creationTimestamp', width: '200px', sortable: true },
    { title: 'Operation', name: 'operation', sortable: false, width: '200px' },
];

const service = {
    create: workloadService.createWorkload,
    list: workloadService.getWorkloads,
    get: workloadService.getInstance,
    delete: workloadService.deleteInstance,
    modify: workloadService.modifyWorkload,
    patch: workloadService.patchWorkload,
};

const resolver = toDeploymentPlainObject;

export default {
    filters,
    listColumns,
    service,
    resolver
};
