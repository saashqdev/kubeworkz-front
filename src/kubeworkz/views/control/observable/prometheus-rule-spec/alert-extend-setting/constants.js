export const dimensions = [
    { text: 'Namespace', value: 'namespace' },
    { text: 'Pod', value: 'pod' },
    { text: 'Container', value: 'container' },
    { text: 'Workload', value: 'workload' },
];

export const scopesChoice = {
    workload: [
        { text: 'Deployment', value: 'deployment' },
        { text: 'StatefulSet', value: 'statefulset' },
    ],
    storage: [
        { text: 'cephfs', value: 'cephfsPersistentvolumeclaim' },
        { text: 'other', value: 'persistentvolumeclaim' },
    ],
};

export const scopesContent = {
    workload: 'Workload type',
    storage: 'Storage source',
    storagecephfs: 'Storage type',
    network: 'Service type',
    nodata: '',
    pods: 'Workload type',
};
