import { upperFirst } from 'lodash';
import wrapper from './wrapper';

export default {
    path: 'control',
    name: 'control',
    redirect: { name: 'control.dashboard' },
    component: () => import(/* webpackChunkName: "control-common" */'kubeworkz/views/control/index.vue'),
    children: [
        {
            path: 'dashboard',
            name: 'control.dashboard',
            component: () => /* webpackChunkName: "control-workload" */ import('kubeworkz/views/control/monitor/monitor.vue'),
            meta: {
                breadCrumb: 'Resource monitoring',
                resource: 'kube-resource-namespace',
            },
        },
        {
            path: 'lens/:type',
            name: 'control.lens',
            component: () => import(/* webpackChunkName: "control-lens" */'kubeworkz/views/control/logseer/lens/index.vue'),
            meta: {
                breadCrumb(name, relative) {
                    const type = relative[1];
                    let p;
                    if (type === 'normal') {
                        p = 'search';
                    }
                    if (type === 'stream') {
                        p = 'live streaming';
                    }
                    if (type === 'trace') {
                        p = 'full link search';
                    }
                    return `Log query ${p} model`;
                },
            },
        },
        {
            path: 'bootstrap',
            name: 'control.bootstrap',
            component: () => import(/* webpackChunkName: "control-common" */'kubeworkz/views/control/bootstrap/index.vue'),
            meta: {
                breadCrumb: 'Common tool',
            },
        },
        {
            path: 'crd',
            name: 'crd',
            component: () => import(/* webpackChunkName: "control-crd" */'kubeworkz/views/control/crd/index.vue'),
            redirect: { path: '/control/crd/Cluster' },
            meta: {
                breadCrumb: 'Custom resources',
            },
            children: [
                {
                    path: ':level',
                    name: 'crd.list',
                    component: () => import(/* webpackChunkName: "control-crd" */'kubeworkz/views/control/crd/list.vue'),
                    meta: {
                        breadCrumb(name) {
                            return `${name === 'Cluster' ? 'cluster' : 'space'} level`;
                        },
                    },
                    children: [
                        {
                            path: ':name/:version',
                            name: 'crd.detail',
                            component: () => import(/* webpackChunkName: "control-crd" */'kubeworkz/views/control/crd/detail.vue'),
                            meta: {
                                breadCrumb(name, list) {
                                    return `${list[2]} ${list[3]}`;
                                },
                            },
                        },
                    ],
                },

                // {
                //     path: 'detail/:level/:name/:version',
                //     component: () => import(/* webpackChunkName: "control-crd" */'./detail.vue'),
                //     children: [
                //         {
                //             path: 'instances',
                //             component: () => import(/* webpackChunkName: "control-crd" */'./instances.vue'),
                //         }
                //     ],
                // }
            ],
        },
        {
            path: ':workload',
            name: 'control.workload',
            component: wrapper,
            redirect: { name: 'control.workload.list' },
            meta: {
                breadCrumb(name) {
                    console.log(name);
                    switch (name) {
                        case 'logconfigs':
                            return 'Log task management';
                        case 'persistentvolumeclaims':
                            return 'PersistentVolumeClaims';
                        case 'AlertmanagerConfig':
                            return 'Alert policy group';
                        case 'PrometheusRule':
                            return 'Alert rules';
                        default:
                            return upperFirst(name);
                    }

                },
            },
            children: [
                {
                    path: 'list',
                    name: 'control.workload.list',
                    component: () => /* webpackChunkName: "control-workload" */ import('../views/control/list.js'),
                    meta: {
                        subroot: true,
                    },
                },
                {
                    path: 'create',
                    name: 'control.workload.create',
                    component: () => /* webpackChunkName: "control-workload" */ import('../views/control/edit.js'),
                    meta: {
                        breadCrumb: 'Create',
                        type: 'create',
                    },
                },
                {
                    path: ':instance',
                    redirect: { name: 'control.workload.info' },
                    component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/index.vue'),
                    meta: {
                        breadDisabled(name, arr) {
                            return arr[0] === 'PrometheusRule';
                        },
                        breadCrumb(name) { return name; },
                    },
                    children: [
                        {
                            path: 'updateImage',
                            name: 'control.workload.updateImage',
                            component: () => /* webpackChunkName: "kubeworkz-control" */ import('../views/control/workload/dp/updateImage.vue'),
                            meta: {
                                breadCrumb: 'Rolling Update',
                            },
                        },
                        {
                            path: 'edit',
                            name: 'control.workload.edit',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/edit.js'),
                            meta: {
                                breadCrumb: 'Edit',
                                type: 'edit',
                            },
                        },
                        {
                            path: 'info',
                            name: 'control.workload.info',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/info.js'),
                            meta: {
                                breadCrumb: 'Basic Information',
                            },
                        },
                        {
                            path: 'pod',
                            name: 'control.workload.pod',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/pod.vue'),
                            meta: {
                                breadCrumb: 'Copy',
                            },
                        },
                        {
                            path: 'monitor',
                            name: 'control.workload.monitor',
                            component: () => /* webpackChunkName: "control-workload" */ import('kubeworkz/views/control/monitor/monitor.vue'),
                            meta: {
                                breadCrumb: 'Monitor',
                            },
                        },
                        {
                            path: 'jobs',
                            name: 'control.workload.jobs',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/jobs.vue'),
                            meta: {
                                breadCrumb: 'Task List',
                            },
                        },
                        {
                            path: 'event',
                            name: 'control.workload.event',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/event.vue'),
                            meta: {
                                breadCrumb: 'Event',
                            },
                        },
                        {
                            path: 'condition',
                            name: 'control.workload.condition',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/condition.vue'),
                            meta: {
                                breadCrumb: 'Condition Information',
                            },
                        },
                        {
                            path: 'log',
                            name: 'control.workload.log',
                            component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/log.vue'),
                            meta: {
                                breadCrumb: 'Log',
                            },
                        },
                        {
                            path: 'extrnal',
                            name: 'control.workload.external',
                            component: () => /* webpackChunkName: "control-workload" */ import('kubeworkz/views/control/service/detail/external.vue'),
                            meta: {
                                breadCrumb: 'External Service Port',
                            },
                        },
                        {
                            path: ':pod',
                            component: wrapper,
                            redirect: { name: 'control.workload.containerdetail' },
                            meta: {
                                breadCrumb(name) { return name; },
                                breadDisabled: true,
                            },
                            children: [
                                {
                                    path: ':container',
                                    name: 'control.workload.containerdetail',
                                    component: () => /* webpackChunkName: "control-workload" */ import('../views/control/workload/detail/tabs/container-detail.vue'),
                                    meta: {
                                        breadCrumb(name) { return name; },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
