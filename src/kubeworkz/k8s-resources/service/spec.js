import { pickBy, isObjectLike, zipObjectDeep, toNumber, omit } from 'lodash';
import { getFromModel, toObjectArray, KVtoObject } from '../base/utils';
import {
    SERVICE_LOAD_BALANCER_IP_TYPE_MAP,
} from 'kubeworkz/utils/constance';

export const toPlainObject = model => {
    const g = getFromModel(model);
    const name = g('metadata.name'); // service name
    const namespace = g('metadata.namespace'); // namespace
    const ports = (g('spec.ports') || []).map(p => ({ // Ports
        ...p,
        text: `${name}.${namespace}:${p.port}`,
    }));
    const annotations = g('metadata.annotations', {}); // annotations
    const ipType = annotations['nlb.netease.com/lb-network'] // LoadBalancer IP type
        || annotations['netease.com/lb-network']
        || annotations['netease.com_loadbalancer_network'];
    const ipTypeText = (SERVICE_LOAD_BALANCER_IP_TYPE_MAP[ipType] || {}).text || '-'; // LoadBalancer IP Type text
    const bandWidth = annotations['nlb.netease.com/lb-bandwidth'] // LoadBalancer bandwidth
        || annotations['netease.com/lb-bandwidth']
        || annotations[`netease.com_loadbalancer_${ipType}_bandwidth`]
        || annotations['netease.com_loadbalancer_bandwidth']
        || '-';
    const type = g('spec.type'); // Type
    const clusterIP = g('spec.clusterIP'); // clusterIP
    const selector = toObjectArray(g('spec.selector', {}), 'key', 'value'); // tag selector
    const bandwidthMode = bandWidth === '-' ? 'system' : 'user'; // Bandwidth type (cluster default configuration, customized)
    const hasExternalIPs = !!g('spec.externalIPs');
    let template; // How to use ClusterIP
    if (!model) {
        template = 'normal';
    } else if (type === 'NodePort') {
        template = 'nodePort';
    } else if (type === 'LoadBalancer') {
        template = 'loadBalancer';
    } else if (clusterIP === 'None') {
        template = 'headless';
    } else if (hasExternalIPs) {
        template = 'external';
    } else {
        template = 'normal';
    }
    return {
        ...pickBy(g('spec'), v => !isObjectLike(v)),
        externalIPs: g('spec.externalIPs') || [],
        ports, // Ports
        matchLabels: selector, // tag selector
        sessionAffinity: g('spec.sessionAffinity', 'None'), // Session persistence
        ipType, // LoadBalancer IP type
        ipTypeText, // LoadBalancer IP type text
        bandWidth, // LoadBalancer bandwidth
        host: name + '.' + namespace, // service details - domain name
        template, // How to use ClusterIP
        bandwidthMode, // Bandwidth type (cluster default configuration, customized)
        enableSelecter: template === 'headless' ? !!selector.length : true, // Whether the headless type enables the selector
    };
};

const getType = template => {
    let type;
    switch (template) {
        case 'nodePort':
            type = 'NodePort';
            break;
        case 'loadBalancer':
            type = 'LoadBalancer';
            break;
        default:
            type = 'ClusterIP';
            break;
    }
    return type;
};
const getClusterIP = (template, value) => (template === 'headless' ? 'None' : value);
const effectKeys = [
    'ports',
    'type',
    'clusterIP',
    'externalIPs',
    'selector',
    'sessionAffinity',
];
export function toK8SObject(model) {
    const g = getFromModel(model);
    const template = g('spec.template');
    return zipObjectDeep(effectKeys, [
        g('spec.ports').filter(i => i.port && i.targetPort).map(p => {
            const port = {
                name: p.name, // Port name
                protocol: p.protocol, // Port protocol
                port: toNumber(p.port), // Port service port
                targetPort: toNumber(p.targetPort), // Port target port
            };
            if (template === 'nodePort') {
                port.nodePort = toNumber(p.nodePort); // Port NodePort
            }

            return port;
        }),
        getType(template),
        getClusterIP(template, g('spec.clusterIP')),
        (template === 'external' ? g('spec.externalIPs') : undefined),
        (template === 'headless' && !g('spec.enableSelecter') ? undefined : KVtoObject(g('spec.matchLabels'), 'key', 'value')), // tag selector
        g('spec.sessionAffinity'), // Session persistence
    ]);
}

export function toPatchObject(model) {
    const pureSourceSpec = model.puresource.spec;
    const newK8SSpecObject = toK8SObject(model);
    const remains = omit(pureSourceSpec, effectKeys);
    return Object.assign({}, remains, newK8SSpecObject);
}
