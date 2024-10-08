import { cloneDeep } from 'lodash';
import { getFromModel, genReset } from './utils';

import {
    toPlainObject as toMetadataPlainObject,
    toK8SObject as toMetadataK8SObject,
} from '../metadata'; // metadate related conversion functions

import {
    toPlainObject as toPodTemplatePlainObject,
} from '../pod/pod-template'; // pod-template related conversion functions

import {
    toK8SObject as toPodSpecK8SObject,
} from '../pod/pod-spec'; // pod-spec related conversion functions

import {
    toPlainObject as toContainerPlainObject,
    toK8SObject as toContainerK8SObject,
} from '../container'; // Container related conversion functions

export function toPlainObject(model) {
    const g = getFromModel(model);
    return ({
        toSpecPlainObject, // Spec conversion function
        toStatusPlainObject, // Status conversion function
        podTemplatePath = 'spec.template', // Pod template path
        containerPath = 'spec.template.spec', // Container spec path
    }) => {
        const podTemplate = toPodTemplatePlainObject(g(podTemplatePath));
        const containers = toContainerPlainObject(g(containerPath), model);
        const obj = {
            apiVersion: g('apiVersion'),
            kind: g('kind'),
            spec: toSpecPlainObject(model, containers, podTemplate),
            metadata: toMetadataPlainObject(model, containers, podTemplate),
            podTemplate,
            containers,
            status: toStatusPlainObject(model, containers, podTemplate),
            podStatus: g('podStatus') || {}, // pod status
            puresource: Object.freeze(cloneDeep(model)), // k8s raw data
        };
        // Object.defineProperty(obj, 'puresource', {
        //     value: ,
        //     writable: false,
        //     configurable: false,
        // });
        return obj;
    };
}

export function toK8SObject(model) {
    return ({
        apiVersion,
        kind,
        toSpecK8SObject, // Spec conversion function
    }) => {

        const metadata = toMetadataK8SObject(model);
        const labels = {
            'kubeworkz.io/app': metadata.name,
            'kubeworkz.io/kind': (kind || '').toLocaleLowerCase(),
        };
        Object.assign(metadata.labels, labels);

        const podMetadata = toMetadataK8SObject(model.podTemplate);
        Object.assign(podMetadata.labels, labels);

        const podSpec = toPodSpecK8SObject(model);
        const {
            containers,
            initContainers,
            volumes,
        } = toContainerK8SObject(model);
        podSpec.volumes = volumes.concat(podSpec.volumes);

        const obj = {
            apiVersion,
            kind,
            metadata,
            spec: {
                selector: {
                    matchLabels: labels,
                },
                template: {
                    metadata: podMetadata,
                    spec: {
                        containers,
                        initContainers,
                        ...podSpec,
                    },
                },
            },
        };
        Object.assign(obj.spec, toSpecK8SObject(model, metadata, obj));
        return obj;
    };
}

export function toModifyK8SObject(model) {
    return ({
        apiVersion,
        kind,
        toSpecK8SObject,
        toModifyK8SObject,
        podTemplatePath = 'spec.template',
    }) => {
        const puresource = model.puresource;
        const newObject = toK8SObject(model)({
            apiVersion,
            kind,
            toSpecK8SObject,
        });
        const target = cloneDeep(puresource);

        toModifyK8SObject(target, newObject);

        const resetProperty = genReset(target, newObject);

        resetProperty(`${podTemplatePath}.metadata.labels`);
        resetProperty(`${podTemplatePath}.metadata.annotations`);
        resetProperty(`${podTemplatePath}.spec.restartPolicy`);
        resetProperty(`${podTemplatePath}.spec.containers`);
        resetProperty(`${podTemplatePath}.spec.initContainers`);
        resetProperty(`${podTemplatePath}.spec.imagePullSecrets`);
        resetProperty(`${podTemplatePath}.spec.affinity`);
        resetProperty(`${podTemplatePath}.spec.tolerations`);
        resetProperty(`${podTemplatePath}.spec.volumes`);
        resetProperty(`${podTemplatePath}.spec.hostNetwork`);
        resetProperty(`${podTemplatePath}.spec.dnsPolicy`);
        return target;
    };
}
