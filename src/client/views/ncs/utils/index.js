import {
    SEVERITY_MAP,
    MIDDLE_STATUS_LIST,
    SEVERITY_TEXT_MAP,
    RELEASE_STATUS_MAP,
} from './map';
import { ignoredKeys } from './filters';
import filters from './filters';

import _ from 'lodash';


/**
 * Processing workload status
 * @param {Object} workload - Workload
 * @param {Boolean} stateful - Is there a status
 */
const getStatus = (workload, stateful = false) => {
    const { RequestK8sSuccess, podInfo, status } = workload;

    // New: status.replicas is empty, display warning
    if (RequestK8sSuccess !== 'True' || podInfo.warnings.length || (status && !status.replicas)) { return 'warning'; } else if (podInfo.pending) { return 'waiting'; }
    return 'success';

};

/**
     * Get the version number from the image's imagePath
     * @param  {String} _path imagePath
     * @return {String}       version number
     */
const getTagFromImagePath = path => {
    path = path || '';
    let result;

    result = path.split('/').pop();
    result = result.split(':');
    result = (result.length < 2) ? 'latest' : result.pop();

    return result;
};
const getRepoDesc = info => {
    if (!info || (info && !Object.keys(info).length)) { return 'No mirror selected'; }
    return info.userName + '/' + info.repoName + ':' + this.getTagFromImagePath(info.selectedPath);
};

const getDefaultContainer = stateful => {
    const container = {
        Name: '', // Container name
        Image: '', // Mirror URL
        LogDirs: [], // Log path array
        Args: [], // Docker CMD command
        Command: [], // Docker EntryPoint command
        Envs: [], // Environment variable array
        ResourceRequirements: {},
        SecurityContext: { // SecurityContext (security options)
            Privilege: false, // Default permissions or root permissions
            Capabilities: [], // Container permissions
        },
    };

    if (stateful) {
        Object.assign(container, {
            SshKeyIds: [],
            DataDisks: [],
        });
    }
    return container;
};

const getCPU = (cpu = '') => (cpu.includes('m') ? (cpu.split('m')[0] / 1000) : (cpu ? +cpu : 0.1));
const getMemory = (memory = '') => {
    // default value
    if (!memory) return 128;
    const MAP = [ 'Mi', 'Gi', 'Ti' ];
    const value = memory.split('i')[0].slice(0, -1);
    const index = MAP.findIndex(unit => memory.endsWith(unit));
    return index !== -1 ? (value * Math.pow(1024, index)) : value;
};
/**
 * Convert the k8s converted numerical string into a numerical value
 * Correspondence between suffix characters and numbers: [10^-3 m] [10^3 k] [10^6 M] [10^9 G]
 * @param {String} num - k8s converted numerical string
 * @return {Number}
 */
const formatNumber = (num = '') => {
    const value = parseInt(num);
    const map = {
        m: -3,
        '': 0,
        k: 3,
        M: 6,
        G: 9,
    };
    if (isNaN(value)) return 0;
    const suffix = num.slice(value.toString().length);
    const multiple = suffix in map ? Math.pow(10, map[suffix]) : 1;

    return multiple * value;
};

// The workload (Deployment || statefulSet) instance data structure returned by the backend is now too complex and needs to be processed.
/**
 * @param {object} model - Workload instance model returned by the backend
 * @param {boolean} simple - Is it simple mode?
 * @param {string} type - Workload type (Deployment || StatefulSet) [not used yet]
 */
const normalizeWorkload = (model = {}, simple = false) => {
    const { metadata, RequestK8sSuccess, pods: podInfo, status, spec } = model;
    const { name, namespace, creationTimestamp, labels: workloadLabels } = (metadata || {});
    const [ minReadySeconds, replicas, serviceName, volumeClaimTemplates, matchLabels, strategy, maxSurge, maxUnavailable ] = _.at(spec || {}, [
        'minReadySeconds', 'replicas', 'serviceName', 'volumeClaimTemplates', 'selector.matchLabels',
        'strategy', 'strategy.rollingUpdate.maxSurge', 'strategy.rollingUpdate.maxUnavailable',
    ]);
    const [ labels, containers, volumes, restartPolicy, imagePullSecrets, affinity ] = _.at(spec || {}, [
        'template.metadata.labels', 'template.spec.containers', 'template.spec.volumes',
        'template.spec.restartPolicy', 'template.spec.imagePullSecrets', 'template.spec.affinity',
    ]);

    // Custom fields
    podInfo && (podInfo.message = RequestK8sSuccess !== 'True' ? 'Unable to get status' : (podInfo.warnings && podInfo.warnings.length && podInfo.warnings[0].message));

    // Simple mode return
    if (simple) {
        return {
            name,
            status,
            replicas,
            namespace,
            creationTimestamp,
            RequestK8sSuccess,
            podInfo: podInfo || {},
            fullModel: model,
        };
    }

    // Internal fields will be adjusted later.
    const tmpContainers = _.cloneDeep(containers);
    // Filter out system default tags
    const customLabels = {};
    const systemLabels = {};
    Object.keys(labels).forEach(item => {
        if (ignoredKeys.find(key => item.startsWith(key))) { systemLabels[item] = labels[item]; } else { customLabels[item] = labels[item]; }
    });

    tmpContainers.forEach(item => {
        let [ cpu, memory, limitCPU ] = _.at(item.resources || {}, [ 'requests.cpu', 'requests.memory', 'limits.cpu' ]);
        const gpu = ((item.resources || {}).limits || {})['nvidia.com/gpu'];
        cpu = getCPU(cpu);
        // It is the CPU and memory of the corresponding requests (corresponding to decimal format, without 'm' or 'Mi' unit)
        // Rewrite the corresponding resource
        item.resources = {
            cpu,
            gpu: formatNumber(gpu) || 0, // Fields that are not necessarily returned
            memory: getMemory(memory),
            multiple: Math.round(getCPU(limitCPU) / cpu) || 1,
        };

        const volumeMounts = item.volumeMounts || [];
        item.dirs = volumeMounts.filter(item => item.name.startsWith('log-volume')).map(item => ({ dir: item.mountPath }));
        item.volumes = volumeMounts.filter(item => item.name.startsWith('data-volume'))
            .map(item => {
                const volume = volumes.find(sub => sub.name === item.name);
                const names = _.at(volume || {}, [ 'persistentVolumeClaim.claimName', 'secret.secretName', 'configMap.name' ]);
                const index = names.findIndex(item => item);
                const type = [ 'pvc', 'secret', 'configMap' ][index];
                return {
                    type,
                    name: names[index],
                    mountPath: item.mountPath,
                    pvcName: names[0] || '',
                    secretName: names[1] || '',
                    configMapName: names[2] || '',
                    volumeClaimTemplateName: '',
                };
            });
        // const volumeClaimTemplates = volumeMounts.filter((item) => (volumeClaimTemplates || []).find((subItem) => subItem.metadata.name === item.name)).map((item) => ({
        // todo
        const volumeClaimTemplates = volumeMounts.filter(item => ![ 'log-volume', 'data-volume' ].some(keyword => item.name.startsWith(keyword))).map(item => ({
            type: 'volumeClaimTemplate',
            name: item.name,
            mountPath: item.mountPath,
            volumeClaimTemplateName: item.name,
            pvcName: '',
            secretName: '',
            configMapName: '',
        }));
        item.volumes.push(...volumeClaimTemplates);
    });

    return Object.assign({}, {
        metadata,
        name,
        status,
        replicas,
        strategy,
        namespace,
        matchLabels,
        creationTimestamp,
        RequestK8sSuccess,
        labels: workloadLabels,

        serviceName, // dedicated to statefulSet
        volumeClaimTemplates: (volumeClaimTemplates || []).map(item => ({
            name: item.metadata.name,
            mode: item.spec.accessModes[0],
            storageClassName: item.spec.storageClassName,
            storage: parseInt(item.spec.resources.requests.storage),
        })),

        maxSurge,
        maxUnavailable,
        minReadySeconds,
        pod: {
            labels,
            customLabels,
            systemLabels,
            restartPolicy,
            imagePullSecrets: imagePullSecrets ? imagePullSecrets.map(item => item.name) : [],
            nodeAffinity: (affinity || {}).nodeAffinity,
            podAffinity: (affinity || {}).podAffinity,
            podAntiAffinity: (affinity || {}).podAntiAffinity,
        },
        podInfo: podInfo || {},
        containers: tmpContainers.map((item, index) => Object.assign({}, item, { fullModel: containers[index] })),
        fullModel: model,
    });
};

const normalizePod = (model = {}) => {
    const { name, creationTimestamp, namespace, ownerReferences } = model.metadata || {};
    const { phase, podIP } = model.status || {};
    let cpuUsage = 0,
        memoryUsage = 0;
    const containers = (model.status || {}).containerStatuses || [];
    const restartCount = containers.reduce((acc, next) => acc + next.restartCount, 0);
    (model.spec.containers || []).forEach(item => {
        const [ cpu, memory ] = _.at(item, [ 'resources.requests.cpu', 'resources.requests.memory' ]);
        cpuUsage += getCPU(cpu);
        memoryUsage += getMemory(memory);
    });
    // container.status is a custom field, running || terminated || waiting, the default is waiting.
    containers.forEach(item => item.status = Object.keys(item.state)[0] || 'waiting');
    return Object.assign({}, {
        name,
        namespace,
        restartCount,
        ownerReferences,
        creationTimestamp,
        phase,
        podIP,
        containers,
        // When the CPUs of multiple containers are added together, there will be too many decimal places since they are decimals.
        cpuUsageText: (cpuUsage.toString().split('.')[1].length > 3 ? cpuUsage.toFixed(3) : cpuUsage) + ' Cores',
        memoryUsageText: memoryUsage + ' MiB',
        fullModel: model,
    });
};

const normalizeService = (model = {}) => {
    const item = model.item || {};
    const { name, creationTimestamp, namespace, labels, annotations } = item.metadata || {};
    const { ports, selector, clusterIP, type } = item.spec || {};
    // customize
    const host = name + '.' + namespace;
    let template = (annotations || {}).template || '';
    // If annotations are not declared in a template field, additional logic initialization is required.
    if (!template) {
        if (type === 'NodePort') { template = 'nodePort'; } else if (clusterIP === 'None') { template = 'headless'; } else if (Object.keys(selector || {}).length) { template = 'normal'; } else { template = 'external'; }
    }

    return Object.assign({}, {
        name,
        labels,
        namespace,
        annotations: annotations || {},
        creationTimestamp,
        host,
        type,
        ports,
        clusterIP,
        template,
        selector: selector || {}, // There are legal situations where the selector is undefined, so it is compatible.
        extendInfo: (model.extendInfo && model.extendInfo.ips) ? model.extendInfo : { ips: [] }, // The interface compatible with extendInfo returns
        fullModel: item,
    });
};

const normalizeIngress = (model = {}) => {
    const { name, creationTimestamp, namespace, labels, annotations } = model.metadata || {};
    const [ rules, tls ] = _.at(model || {}, [ 'spec.rules', 'spec.tls' ]);

    const port = tls ? 443 : 80;
    const useSameSecret = !(tls && tls.length > 1);
    const map = [];
    if (!useSameSecret) {
        tls.forEach(item => {
            item.hosts.forEach(host => map[host] = item.secretName);
        });
    }

    return Object.assign({}, {
        port,
        dispatch: annotations['nginx.ingress.kubernetes.io/load-balance'] || 'round_robin',
        secretName: tls && tls[0].secretName,
        enableSession: !!annotations['nginx.ingress.kubernetes.io/session-cookie-name'],
        cookieName: annotations['nginx.ingress.kubernetes.io/session-cookie-name'],
        useSameSecret,

        rules: !useSameSecret ? rules.map(item => Object.assign(item, { secretName: map[item.host] })) : rules,
        tls,
        name,
        labels,
        namespace,
        annotations,
        creationTimestamp,
        fullModel: model,
    });
};

const normalizeSecret = (model = {}) => {
    const { name, creationTimestamp, namespace, labels } = model.metadata || {};
    const { type, data } = model;

    return Object.assign({}, {
        type,
        data: data || {},
        name,
        isDefault: 'system/defaultImagePullSecret' in (labels || {}),
        namespace,
        creationTimestamp,
        fullModel: model,
    });
};

const normalizeConfigMap = (model = {}) => {
    const { name, creationTimestamp, namespace } = model.metadata || {};

    return Object.assign({}, {
        data: model.data || {},
        binaryData: model.binaryData || {},
        name,
        namespace,
        creationTimestamp,
        fullModel: model,
    });
};

const sizeProcessor = function(result) {
    // this is monitor-chart
    const keys = this.metrics.map(item => item.key);
    const max = Math.max.apply(null, _.flatten(result.map(item => keys.map(key => item[key]))));
    const { unit } = filters.num(isNaN(+max) ? 0 : max);
    const multiple = Math.pow(1024, [ 'B', 'K', 'M', 'G', 'T', 'P' ].indexOf(unit));
    this.unit = (unit === 'B' || !unit || !this.unit.startsWith('B')) ? this.unit : (unit + 'i' + this.unit);

    result.forEach(item => {
        keys.forEach(key => item[key] = (item[key] / multiple).toFixed(2));
    });
    return result;
};

const getStep = (startTime, endTime) => {
    // Whether to use seconds as the minimum unit (one move is milliseconds)
    const isSecond = (endTime + '').length < 12;
    // period is min as unit
    let period = (endTime - startTime) / 60;
    !isSecond && (period = Math.floor(period / 1000));
    // 6h、24h、7d、30d
    const PERIOD_MAP = [ 0, 6 * 60, 24 * 60, 24 * 7 * 60, 30 * 24 * 60 ];
    const STEP_MAP = [ '1m', '15m', '1h', '6h', '1d' ];
    const index = PERIOD_MAP.findIndex((item, index, arr) => (index < (arr.length - 1) ? (period >= item && period < arr[index + 1]) : true));

    return STEP_MAP[index];
};

const getDashBoardTabs = uiAuth => [
    uiAuth.viewClusterMonitor ? { title: 'Resource', name: 'dashboard.index.resource' } : null,
    uiAuth.viewTenantMonitor ? { title: 'Tenant', name: 'dashboard.index.tenant' } : null,
    uiAuth.viewProjectMonitor ? { title: 'Project', name: 'dashboard.index.project' } : null,
    uiAuth.viewIngressMonitor ? { title: 'Load balancing', name: 'dashboard.index.ingress' } : null,
].filter(Boolean);

const normalizeTag = tag => {
    const scanInfo = tag.scan_overview || {};
    const { summary, total } = scanInfo.components || {};
    const { update_time, severity, scan_status, job_id } = scanInfo;
    const { name, architecture, os, docker_version, created, author, size } = tag;
    const tmp = { unknow: 0, hard: 0, normal: 0, small: 0, none: 0 };
    summary && summary.forEach(item => {
        tmp[SEVERITY_MAP[item.severity]] = item.count;
    });

    return {
        os,
        name,
        architecture,
        docker_version,
        size: (size / 1024 / 1024).toFixed(2),
        author: author.replace(/"/g, ''),
        createTime: created,
        scanInfo: Object.assign({}, tmp, {
            hasScan: !!tag.scan_overview, // Have you scanned
            total,
            id: job_id,
            status: scan_status,
            time: update_time,
            scanning: MIDDLE_STATUS_LIST.includes(scan_status),
            severity,
            severityText: SEVERITY_TEXT_MAP[severity],
        }),
    };
};

const getReleaseStatusText = status => {
    status = status ? status.toLowerCase() : 'unknown';
    return RELEASE_STATUS_MAP[status] || 'unknown status';
};

const normalizePDB = (model = {}) => {
    const spec = model.spec || {};
    const [ matchLabels, matchExpressions ] = _.at(spec, [ 'selector.matchLabels', 'selector.matchExpressions' ]);
    const ruleKind = 'maxUnavailable' in spec ? 'maxUnavailable' : 'minAvailable';
    return {
        ruleKind,
        ruleValue: spec[ruleKind],
        matchLabels: matchLabels || {},
        matchLabelTexts: matchLabels ? Object.keys(matchLabels).map(key => key + ':' + matchLabels[key]) : [],
        matchExpressions: matchExpressions || [],
        matchExpressionTexts: matchExpressions ? matchExpressions.map(item => {
            const { key, operator, values } = item;
            let tmp = 'key:' + key + ' operator:' + operator;
            values && (tmp = tmp + ' values:' + item.values.join(', '));
            return tmp;
        }) : [],
        name: model.metadata.name,
    };
};

// Returns the workload processed by the backend (used to set the data processing of the page <some parameters are not required>)
const formatExternalWorkload = (model = {}) => {
    const { metadata, status, spec } = model;
    const { name, namespace, labels: workloadLabels } = (metadata || {});
    const [ replicas, serviceName, volumeClaimTemplates, matchLabels ] = _.at(spec || {}, [
        'replicas', 'serviceName', 'volumeClaimTemplates', 'selector.matchLabels',
    ]);
    const [ labels, containers, hostNetwork, restartPolicy, imagePullSecrets, affinity ] = _.at(spec || {}, [
        'template.metadata.labels', 'template.spec.containers', 'template.spec.hostNetwork',
        'template.spec.restartPolicy', 'template.spec.imagePullSecrets', 'template.spec.affinity',
    ]);

    // Internal fields will be adjusted later.
    const tmpContainers = _.cloneDeep(containers);
    // Filter out system default tags
    const customLabels = {};
    const systemLabels = {};
    Object.keys(labels).forEach(item => {
        if (ignoredKeys.find(key => item.startsWith(key))) { systemLabels[item] = labels[item]; } else { customLabels[item] = labels[item]; }
    });

    tmpContainers.forEach(item => {
        let [ cpu, memory, limitCPU ] = _.at(item.resources || {}, [ 'requests.cpu', 'requests.memory', 'limits.cpu' ]);
        const gpu = ((item.resources || {}).limits || {})['nvidia.com/gpu'];
        cpu = getCPU(cpu);
        // It is the CPU and memory of the corresponding requests (corresponding to decimal format, without 'm' or 'Mi' unit)
        // Rewrite the corresponding resource
        item.resources = {
            cpu,
            gpu: formatNumber(gpu) || 0, // Fields that are not necessarily returned
            memory: getMemory(memory),
            multiple: Math.round(getCPU(limitCPU) / cpu) || 1,
        };

        // Filter out system default labels (required for cicd service)
        item.customEnvs = [];
        item.systemEnvs = [];
        item.env && item.env.forEach(subItem => (subItem.name.startsWith('SKIFF_') ? item.systemEnvs.push(subItem) : item.customEnvs.push(subItem)));

        item.dirs = item.logs.map(item => ({ dir: item }));
    });

    return Object.assign({}, {
        metadata,
        name,
        status,
        replicas,
        namespace,
        matchLabels,
        hostNetwork,
        labels: workloadLabels,

        serviceName, // dedicated to statefulSet
        volumeClaimTemplates: (volumeClaimTemplates || []).map(item => ({
            name: item.metadata.name,
            mode: item.spec.accessModes[0],
            storageClassName: item.spec.storageClassName,
            storage: parseInt(item.spec.resources.requests.storage),
        })),

        pod: {
            labels,
            customLabels,
            systemLabels,
            restartPolicy,
            imagePullSecrets: imagePullSecrets ? imagePullSecrets.map(item => item.name) : [],
            nodeAffinity: (affinity || {}).nodeAffinity,
            podAffinity: (affinity || {}).podAffinity,
            podAntiAffinity: (affinity || {}).podAntiAffinity,
        },
        containers: tmpContainers,
        fullModel: model,
    });
};

// Get the sum of the cpu, memory, and gpu data of nodes
const getNodeInfo = (list = []) => {
    list = Array.isArray(list) ? list : [];
    return list.reduce((acc, item) => {
        acc.cpu += item.capacityCpu;
        acc.memory += item.capacityMemory;
        acc.gpu += item.capacityGpu;
        return acc;
    }, { cpu: 0, memory: 0, gpu: 0 });
};
/**
 * @description Return data structure information that meets the requirements of the u-transfer component (retain the original capacityCpu and other field information of the backend)
 *
 * @param {Array} list - node list
 * @param {Boolean} disabled - Whether to disable node movement
 */
const formatNodes = (list = [], disabled = false) => {
    return list.map(item => Object.assign(item, {
        text: item.name + `(C:${item.capacityCpu} M:${item.capacityMemory} G:${item.capacityGpu})`,
        value: item.name,
        disabled,
    }));
};


export {
    getStatus,

    getTagFromImagePath,
    getRepoDesc,
    getDefaultContainer,

    normalizeWorkload,
    normalizePod,
    normalizeService,
    normalizeIngress,
    normalizeSecret,
    normalizeConfigMap,
    normalizeTag,
    normalizePDB,

    sizeProcessor,
    getStep,
    getDashBoardTabs,

    formatNumber,
    getCPU,
    getMemory,
    formatNodes,
    getNodeInfo,

    getReleaseStatusText,

    formatExternalWorkload,
};
