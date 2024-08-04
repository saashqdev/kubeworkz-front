export const ROLES = {
    PLATFORM_ADMIN: 'platformAdmin',
    TENANT_ADMIN: 'tenantAdmin',
    PROJECT_ADMIN: 'projectAdmin',
    REVIEWER: 'reviewer',
};
export const RESOURCE_REQUEST_MAP = [
    { cpu: 0.1, memory: 128 },
    { cpu: 0.5, memory: 512 },
    { cpu: 1, memory: 1024 },
];
export const FIELD_DATA = [
    'metadata.name',
    'metadata.namespace',
    'metadata.uid',
    'spec.nodeName',
    'spec.serviceAccountName',
    'status.hostIP',
    'status.podIP',
];

export const RESOURCE_DATA = [
    'requests.ephemeral-storage',
    'requests.memory',
    'requests.cpu',
    'limits.ephemeral-storage',
    'limits.memory',
    'limits.cpu',
];

export const PVC_MODE_MAP = [
    'ReadWriteOnce',
    'ReadOnlyMany',
    'ReadWriteMany',
];

export const PVC_MODE_TEXT_MAP = {
    ReadWriteOnce: 'exclusive read and write',
    ReadOnlyMany: 'read-only sharing',
    ReadWriteMany: 'shared reading and writing',
};

export const topologyKeyData = [
    'kubernetes.io/hostname',
    'failure-domain.beta.kubernetes.io/zone',
    'failure-domain.beta.kubernetes.io/region',
    'beta.kubernetes.io/instance-type',
];

export const CONTAINERTYPE = {
    normal: {
        text: 'Business container',
        icon: 'container',
    },
    init: {
        text: 'Init container',
        icon: 'initcontainer',
    },
};

export const JOB_STATUS_MAP = {
    Pending: {
        text: 'Not ready',
        icon: 'expire',
    },
    Running: {
        text: 'Executing',
        icon: 'waiting',
    },
    Complete: {
        text: 'Execution completed',
        icon: 'success',
    },
    Failed: {
        text: 'Execution failed',
        icon: 'error',
    },
};

export const CLUSTER_STATUS_MAP = {
    normal: 'normal',
    abnormal: 'abnormal',
    processing: 'running',
    deleting: 'deleting',
};

export const SERVICE_LOAD_BALANCER_IP_TYPE_MAP = {
    private: {
        text: 'Private network IP',
    },
    public: {
        text: 'Public IP',
    },
    idc: {
        text: 'Data center network IP`',
    },
};

export const NODE_TYPE_MAP = {
    'kubeworkz.share': 'shared',
    assigned: 'exclusive',
    unassigned: 'exclusive',
};

export const NODE_STATUS_MAP = {
    unschedulable: 'in maintenance',
    normal: 'normal',
    abnormal: 'abnormal',
};

export const CEPH_TYPE_MAP = {
    'kubernetes.io/rbd': 'CephRbd',
    'ceph.com/rbd': 'CephRbd',
};

export const ignoredKeys = [ 'system', 'kubernetes.io', 'beta.kubernetes.io', 'cicd.skiff.kubeworkz.com' ];

export const PORTS = [
    { text: 80, value: 80 },
    { text: 443, value: 443 },
];

export const DISPATCHS = [
    { text: 'least connections', value: 'least_conn' },
    { text: 'round robin', value: 'round_robin' },
    { text: 'ip hash', value: 'ip_hash' },
];

export const SECRET_TYPES = [
    { value: 'Opaque', text: 'Opaque' },
    { value: 'kubernetes.io/tls', text: 'IngressTLS' },
    { value: 'kubernetes.io/dockerconfigjson', text: 'DockerConfigJson' },
];

export const SECRET_TYPES_ENUM = {
    Opaque: 'Opaque',
    IngressTLS: 'kubernetes.io/tls',
    DockerConfigJson: 'kubernetes.io/dockerconfigjson',
};

export const RESOURCE_RIGHTS = {
    READ: 'READ',
    WRITE: 'WRITE',
};
export const RESOURCE_AUTH_MAP = {
    get: RESOURCE_RIGHTS.READ,
    list: RESOURCE_RIGHTS.READ,
    watch: RESOURCE_RIGHTS.READ,
    create: RESOURCE_RIGHTS.WRITE,
    update: RESOURCE_RIGHTS.WRITE,
    delete: RESOURCE_RIGHTS.WRITE,
};

export const RESOURCE_CONVERT_AUTH_MAP = {
    READ: [ 'get', 'list', 'watch' ],
    WRITE: [ 'create', 'update', 'delete' ],
};


export const LOG_TYPE = {
    dockerStdout: 'Container standard output',
    k8sLogfile: 'Container log files',
    logfile: 'Node log file',
};

export const LOG_STATUS = {
    waiting: 'To be issued',
    loaded: 'Already issued',
    error: 'Abnormal',
    disabled: 'Disabled',
    unknown: 'Unknown',
};

export const OPERATORS = [
    { text: 'Match tag', value: 'label', placeholder: '' },
    { text: 'Operator In', value: 'In', placeholder: 'Multiple values ​​can be entered, separated by spaces.' },
    { text: 'Operator NotIn', value: 'NotIn', placeholder: 'Multiple values ​​can be entered, separated by spaces.' },
    { text: 'Operator Exists', value: 'Exists', placeholder: 'Please enter an integer value' },
    { text: 'Operator DoesNotExist', value: 'DoesNotExist', placeholder: 'Please enter an integer value' },
];

export const CLUSTER_NETWORK_TYPE_MAP = {
    // 'openshift-sdn': {
    //     text: 'Openshift SDN',
    // },
    calico: {
        text: 'Calico',
    },
    // vpc: {
    //     text: 'Kubeworkz Cloud SDN',
    // },
    // other: {
    //     text: 'Other',
    // },
};
