// cpu related conversion map
const SPEC_MAP = ['small', 'medium', 'large', 'xlarge', '2xlarge', '4xlarge'];

const TYPE_MAP = [
    { text: 'GPU computing type gnpc1', value: 'gnpc1' },
    { text: 'GPU computing type gnpc3', value: 'gnpc3' },
    { text: 'GPU graphics acceleration gnpc4', value: 'gnpc4' },
];

const REPO_MAP = {
    'jenkins-java-slave': 'jenkins',
    'jenkins-python-slave': 'jenkins',
    // eslint-disable-next-line
    tomcat_apm: 'tomcat',
    jdk: 'java',
    javaweb: 'javaclass',
    nodejs: 'node',
    'rocket.chat': 'rocket',
    mongo: 'mongodb',
};

const WORKLOAD_STATUS_MAP = {
    running: {
        text: 'Running',
    },
    pending: {
        text: 'Processing',
    },
    abnormal: {
        text: 'Warn',
    },
    arrear: {
        text: 'Service stopped',
    },
    loading: {
        text: '',
    },
};
const POD_STATUS_MAP = {
    texts: {
        Pending: 'Waiting',
        Running: 'Running',
        Succeeded: 'Terminated successfully',
        Failed: 'Failed termination',
        Unknow: 'Abnormal',
    },
    icons: {
        Pending: 'fix',
        Running: 'ok',
        Succeeded: 'ok',
        Failed: 'error',
        Unknow: 'fix',
    },
};
const CONTAINER_STATUS_MAP = {
    texts: {
        Restarting: 'Restarting',
        Running: 'Running',
        RestartFail: 'Restart failed',
        Waiting: 'Creating',
        Terminated: 'Termination',
    },
    icons: {
        Restarting: 'fix',
        Running: 'ok',
        RestartFail: 'error',
        Waiting: 'fix',
        Terminated: 'stop',
    },
};
// A set of states in which relevant actions can be performed
const OPERATE_MAP = {
    // All operations in running state can be performed
    pending: ['!bind'],
    abnormal: ['!bind'],
    arrear: ['delete', 'unbind'],
    // All operations in the loading state cannot be executed
    // setting: ['running', 'Running', 'Abnormal'],
    // delete: ['CreateFail', 'Running', 'Abnormal'],
    // // More operations inside
    // resize: ['Running', 'Abnormal'],
    // updateMirror: ['CreateFail', 'Running', 'Abnormal'],
    // changeSpec: ['Running', 'Abnormal'],
    // redeploy: ['Running', 'Abnormal'],
    // Bind/unbind public IP
    // bind: ['Running'],
    // unbind: ['Creating', 'CreateFail', 'Running', 'Updating', 'Abnormal'],
};

const OPERATES = ['setting', 'delete', 'resize', 'updateMirror', 'changeSpec', 'redeploy', 'bind', 'unbind'];
// Default labels
const DEFAULT_LABELS = ['name', 'zone', 'pod-template-hash'];

const CLUSTER_STATUS_MAP = {
    health: 'normal',
    unhealth: 'abnormal',
};

const NODE_TYPE_MAP = {
    'netease.share': 'shared',
    assigned: 'Exclusive',
    unassigned: 'Exclusive',
};

const NODE_STATUS_MAP = {
    unschedulable: 'In maintenance',
    normal: 'normal',
    abnormal: 'abnormal',
};

const USER_ROLE_MAP = {
    1: 'Administrator',
    2: 'Developer',
    3: 'Visitor',
};

const TENANT_ID = '1';
const PROJECT_ID = 'p1';

const PVC_MODE_MAP = {
    ReadWriteOnce: 'exclusive read and write',
    ReadOnlyMany: 'read-only sharing',
    ReadWriteMany: 'shared reading and writing',
};

const CEPH_TYPE_MAP = {
    'kubernetes.io/rbd': 'CephRbd',
    'ceph.com/rbd': 'CephRbd',
};

const RECLAIM_POLICY_MAP = {
    Delete: 'release immediately',
    // Not open yet
    // Retain: 'reserve',
};

const WORKLOAD_TEXT_MAP = {
    deployment: "Deployment",
    statefulset: "StatefulSet",
};

const POLICY_TRIGGER_MAP = {
    Manual: 'manual',
    Scheduled: 'timing',
    Immediate: 'immediately',
};

const SEVERITY_MAP = {
    5: 'hard',
    4: 'normal',
    3: 'small',
    2: 'unknow',
    1: 'none',
};

const SEVERITY_TEXT_MAP = {
    5: 'serious',
    4: 'medium',
    3: 'lower',
    2: 'unknown',
    1: 'unknown'
};

const MIDDLE_STATUS_LIST = [ 'pending', 'running' ];

const RELEASE_STATUS_MAP = {
    unknown: 'unknown status',
    deployed: 'deployed',
    deleted: 'deleted',
    superseded: 'deprecated',
    failed: 'deployment failed and abandoned',
    deleting: 'deleting',
    'pending_install': 'deploying',
    'pending_upgrade': 'updating',
    'pending_rollback': 'rolling back'
};

export {
    SPEC_MAP,
    TYPE_MAP,
    REPO_MAP,
    WORKLOAD_STATUS_MAP,
    POD_STATUS_MAP,
    CONTAINER_STATUS_MAP,
    OPERATE_MAP,
    OPERATES,
    DEFAULT_LABELS,
    CLUSTER_STATUS_MAP,
    NODE_TYPE_MAP,
    NODE_STATUS_MAP,
    USER_ROLE_MAP,
    PVC_MODE_MAP,
    CEPH_TYPE_MAP,
    RECLAIM_POLICY_MAP,

    TENANT_ID,
    PROJECT_ID,
    WORKLOAD_TEXT_MAP,
    POLICY_TRIGGER_MAP,

    SEVERITY_MAP,
    SEVERITY_TEXT_MAP,
    MIDDLE_STATUS_LIST,

    RELEASE_STATUS_MAP,
};
