import Platform from 'kubeworkz/views/platform/index.vue';
import wrapper from './wrapper';
export default {
    path: 'platform',
    name: 'platform',
    component: Platform,
    meta: {
        credential: true,
    },
    children: [
        {
            path: 'user',
            component: wrapper,
            redirect: { name: 'platform.user' },
            meta: {
                breadCrumb: 'User Management',
            },
            children: [
                {
                    path: 'list',
                    name: 'platform.user',
                    component: () => import(/* webpackChunkName: "platform-user" */'kubeworkz/views/platform/user/index.vue'),
                    meta: {
                        breadCrumb: 'User List',
                    },
                },

            ],
        },
        {
            path: 'role',
            // redirect: { name: 'platform.user' },
            component: () => import(/* webpackChunkName: "platform-user" */'kubeworkz/views/platform/role/index.vue'),
            meta: {
                breadCrumb: 'Role Management',
            },
            children: [
                {
                    path: ':identity',
                    name: 'platform.role.manage',
                    component: () => import(/* webpackChunkName: "platform-user" */'kubeworkz/views/platform/role/roles.vue'),
                    meta: {
                        breadCrumb(name) {
                            switch (name) {
                                case 'platform':
                                    return 'Platform Role';
                                case 'tenant':
                                    return 'Tenant Role';
                                case 'project':
                                    return 'Project Role';
                                default:
                                    return '';
                            }
                        },
                    },
                },

            ],
        },
        {
            path: 'tenant',
            component: () => import(/* webpackChunkName: "platform-tenant" */'kubeworkz/views/platform/tenant/tabs.vue'),
            redirect: { name: 'platform.tenant' },
            meta: {
                breadCrumb: 'Tenant Management',
            },
            children: [
                {
                    path: 'tenant',
                    name: 'platform.tenant',
                    component: () => import(/* webpackChunkName: "platform-tenant" */'kubeworkz/views/platform/tenant/tenant.vue'),
                    meta: {
                        breadCrumb: 'Tenant List',
                    },
                },
                {
                    path: 'project',
                    name: 'platform.project',
                    component: () => import(/* webpackChunkName: "platform-tenant" */'kubeworkz/views/platform/tenant/project.vue'),
                    meta: {
                        breadCrumb: 'Project List',
                    },
                },
                {
                    path: 'member',
                    name: 'platform.member',
                    component: () => import(/* webpackChunkName: "platform-tenant" */'kubeworkz/views/platform/tenant/member.vue'),
                    meta: {
                        breadCrumb: 'Member List',
                    },
                },
            ],
        },
        {
            path: 'quota',
            component: () => import(/* webpackChunkName: "platform-quota" */'kubeworkz/views/platform/quota/index.vue'),
            meta: {
                breadCrumb: 'Tenant Quota',
            },
        },
        {
            path: 'nsquota',
            component: () => import(/* webpackChunkName: "platform-quota" */'kubeworkz/views/platform/namespace/index.vue'),
            meta: {
                breadCrumb: 'Space Management',
            },
        },
        {
            path: 'audit',
            component: () => import(/* webpackChunkName: "platform-audit" */'kubeworkz/views/platform/audit/index.vue'),
            meta: {
                breadCrumb: 'Operational Audit',
            },
        },
        {
            path: 'bootstrap',
            component: () => import(/* webpackChunkName: "platform-bootstrap" */ 'kubeworkz/views/platform/bootstrap/quick-boot.vue'),
            meta: {
                breadCrumb: 'Quick Guide',
            },
        },
        {
            path: 'cluster',
            component: wrapper,
            redirect: { name: 'platform.cluster.list' },
            meta: {
                breadCrumb: 'Cluster Management',
            },
            children: [
                {
                    path: 'list',
                    name: 'platform.cluster.list',
                    component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/index.vue'),
                    meta: {
                        breadCrumb: 'Cluster List',
                    },
                },
                {
                    path: ':name',
                    name: 'platform.cluster.detail',
                    component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/detail.vue'),
                    redirect: { name: 'platform.cluster.detail.info' },
                    meta: {
                        breadCrumb: route => {
                            // console.log(route);
                            return route;
                        },
                    },
                    children: [
                        {
                            path: 'info',
                            name: 'platform.cluster.detail.info',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/details/info.vue'),
                            meta: {
                                breadCrumb: 'Details',
                            },
                        },
                        {
                            path: 'node',
                            name: 'platform.cluster.detail.node',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/details/node.vue'),
                            meta: {
                                breadCrumb: 'Node',
                            },
                        },
                        {
                            path: 'storageclass',
                            name: 'platform.cluster.detail.storageclass',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/details/storageclass.vue'),
                            meta: {
                                breadCrumb: 'Storage Class',
                            },
                        },
                        {
                            path: 'persistentvolumes',
                            name: 'platform.cluster.detail.persistentvolumes',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/details/persistentvolumes.vue'),
                            meta: {
                                breadCrumb: 'Persistent Storage',
                            },
                        },
                        {
                            path: 'network',
                            name: 'platform.cluster.detail.network',
                            component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/details/network/index.vue'),
                            meta: {
                                breadCrumb: 'Network Strategy',
                            },
                            children: [
                                {
                                    path: 'create',
                                    name: 'platform.cluster.detail.network.create',
                                    component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/details/network/edit.vue'),
                                    meta: {
                                        breadCrumb: 'Create a Network Policy',
                                        type: 'create',
                                    },
                                },
                                {
                                    path: 'edit/:namespace/:instance',
                                    name: 'platform.cluster.detail.network.edit',
                                    component: () => import(/* webpackChunkName: "platform-cluster" */'kubeworkz/views/platform/cluster/details/network/edit.vue'),
                                    meta: {
                                        breadCrumb(name, list) { return `Modify Network Policy: ${list[5]}`; },
                                        type: 'edit',
                                    },
                                },
                            ],
                        },
                        {
                            path: 'monitor',
                            name: 'platform.cluster.detail.monitor',
                            component: () => /* webpackChunkName: "platform-cluster" */ import('kubeworkz/views/control/monitor/monitor.vue'),
                            meta: {
                                breadCrumb: 'monitor',
                                resource: 'kube-resource-cluster',
                            },
                        },
                        {
                            path: ':nodename',
                            name: 'platform.cluster.nodedetail',
                            component: () => /* webpackChunkName: "platform-cluster" */ import('kubeworkz/views/platform/cluster/node/index.vue'),
                            redirect: { name: 'platform.cluster.nodedetail.info' },
                            meta: {
                                breadCrumb(name) { return `Pod: ${name}`; },
                                breadDisabled: true,
                            },
                            children: [
                                {
                                    path: 'info',
                                    name: 'platform.cluster.nodedetail.info',
                                    component: () => /* webpackChunkName: "platform-cluster" */ import('kubeworkz/views/platform/cluster/node/info.vue'),
                                    meta: {
                                        breadCrumb: 'Node Details',
                                    },
                                },
                                {
                                    path: 'pod',
                                    name: 'platform.cluster.nodedetail.pod',
                                    component: () => /* webpackChunkName: "platform-cluster" */ import('kubeworkz/views/platform/cluster/node/pod.vue'),
                                    meta: {
                                        breadCrumb: 'Copy',
                                    },
                                },
                                {
                                    path: 'monitor',
                                    name: 'platform.cluster.nodedetail.monitor',
                                    component: () => /* webpackChunkName: "platform-cluster" */ import('kubeworkz/views/control/monitor/monitor.vue'),
                                    meta: {
                                        breadCrumb: 'Monitor',
                                        resource: 'kube-resource-node',
                                    },
                                },
                                {
                                    path: 'event',
                                    name: 'platform.cluster.nodedetail.event',
                                    component: () => /* webpackChunkName: "platform-cluster" */ import('kubeworkz/views/platform/cluster/node/event.vue'),
                                    meta: {
                                        breadCrumb: 'Event',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            path: 'monitor',
            name: 'platform.monitor',
            redirect: { name: 'platform.monitor.list' },
            component: wrapper,
            meta: {
                breadCrumb: 'Component Monitoring',
            },
            children: [
                {
                    path: 'list',
                    name: 'platform.monitor.list',
                    component: () => /* webpackChunkName: "platform-observable" */ import('kubeworkz/views/platform/observable/monitor.vue'),
                    meta: {
                        subroot: true,
                    },
                },
                {
                    path: ':dashboard',
                    name: 'platform.monitor.dashboard',
                    component: () => /* webpackChunkName: "platform-observable" */ import('kubeworkz/views/platform/observable/monitor.js'),
                    meta: {
                        breadCrumb(name) { return name; },
                    },
                },
            ],
        },
        {
            path: 'PrometheusRule',
            name: 'platform.PrometheusRule',
            component: wrapper,
            redirect: { name: 'platform.PrometheusRule.list' },
            meta: {
                breadCrumb: 'Alert rules',
            },
            children: [
                {
                    path: 'list',
                    name: 'platform.PrometheusRule.list',
                    component: () => /* webpackChunkName: "platform-observable" */ import('kubeworkz/views/platform/observable/prometheus-rule.vue'),
                    meta: {
                        subroot: true,
                    },
                },
                {
                    path: ':cluster',
                    component: wrapper,
                    meta: {
                        skip: true,
                    },
                    children: [
                        {
                            path: 'create',
                            name: 'platform.PrometheusRule.create',
                            component: () => /* webpackChunkName: "platform-observable" */ import('kubeworkz/views/platform/observable/prometheus-rule-edit.vue'),
                            meta: {
                                breadCrumb: 'Create',
                                type: 'create',
                            },
                        },
                        {
                            path: ':instance',
                            component: () => /* webpackChunkName: "platform-observable" */ import('kubeworkz/views/platform/observable/prometheus-rule-instance.vue'),
                            meta: {
                                breadCrumb(name) { return name; },
                                breadDisabled: true,
                            },
                            children: [
                                {
                                    path: 'edit',
                                    component: () => /* webpackChunkName: "platform-observable" */ import('kubeworkz/views/platform/observable/prometheus-rule-edit.vue'),
                                    meta: {
                                        breadCrumb: 'Edit',
                                        type: 'edit',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            path: 'AlertmanagerConfig',
            name: 'platform.AlertmanagerConfig',
            component: () => /* webpackChunkName: "platform-observable" */ import('kubeworkz/views/platform/observable/alertmanager-config.vue'),
            meta: {
                breadCrumb: 'Global Alert Configuration',
            },
        },
    ],
};
