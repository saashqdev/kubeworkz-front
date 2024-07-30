import {
    getFromModel,
} from '../base';

import {
    toPlainObject as toMetadataPlainObject,
} from '../metadata';

export const toPlainObject = model => {
    const g = getFromModel(model);

    return {
        metadata: toMetadataPlainObject(model),
        tenant: g('metadata.labels["kubeworkz.io/tenant"]'),
        project: g('metadata.labels["kubeworkz.io/project"]'),
        role: g('roleRef.name'),
        user: g('subjects[0].name'),
    };
};

export const toK8SObject = (user, tenant, project, role) => {
    const gt = getFromModel(tenant);
    const gp = getFromModel(project);
    const projectNS = gp('spec.namespace');
    const tenantNS = gt('spec.namespace');
    const namespace = projectNS || tenantNS;

    // const namespaceliteral = projectNS ? `kubeworkz-project-${projectNS}` : `kubeworkz-tenant-${tenantNS}`;
    const obj = {
        kind: 'RoleBinding',
        apiVersion: 'rbac.authorization.k8s.io/v1',
        metadata: {
            annotations: { 'kubeworkz.io/sync': 'true' },
            labels: {
                'kubeworkz.io/rbac': 'true',
                'kubeworkz.io/tenant': gt('metadata.name'),
            },
            name: `${user}-in-${namespace}`,
            namespace,
        },
        roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: role,
        },
        subjects: [
            {
                kind: 'User',
                name: user,
            },
        ],
    };

    if (projectNS) {
        obj.metadata.labels['kubeworkz.io/project'] = gp('metadata.name');
    }
    return obj;
};

export const toPatchObject = model => {
    const g = getFromModel(model);
    return {
        spec: {
            displayName: g('spec.displayName'),
        },
    };
};
