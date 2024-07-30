export function toK8SObject({
    namespace,
    tenant,
    project,
    scope,
}) {
    return {
        apiVersion: 'hnc.x-k8s.io/v1alpha2',
        kind: 'SubnamespaceAnchor',
        metadata: {
            labels: {
                'kubeworkz.io/project': project,
                'kubeworkz.io/tenant': tenant,
            },
            name: namespace,
            namespace: scope,
        },
    };
}
