export const specCRD = {
    group: 'monitoring.coreos.com',
    version: 'v1alpha1',
    plural: 'alertmanagerconfigs',
};

export const rulespecCRD = {
    group: 'monitoring.coreos.com',
    version: 'v1',
    plural: 'prometheusrules',
};

export const critical = [
    { text: 'Info', value: 'info' },
    { text: 'Warning', value: 'warning' },
    { text: 'Critical', value: 'critical' },
];
