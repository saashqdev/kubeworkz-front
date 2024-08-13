<template>
  <div>
    <router-view
      v-if="needTransparent"
    />
    <template v-else>
      <headCard
        v-if="workload !== 'pods' && !withInstanceTransparent"
        :title="name"
      >
        <div slot="logo">
          {{ (name || '').substring(0, 2).toUpperCase() }}
        </div>
        <div slot="act">
          <operateList>
            <template v-if="workload !== 'jobs'">
              <template v-if="['deployments', 'statefulsets'].includes(workload)">
                <operateButtonOption
                  :disabled="isReview"
                  @click="toResize"
                >
                  Adjust the number of pods
                </operateButtonOption>
              </template>
              <operateButtonOption
                v-if="[ 'deployments' ].includes(workload)"
                @click="toUpdateImage(name)"
              >
                Rolling update
              </operateButtonOption>
              <template v-if="['deployments', 'statefulsets'].includes(workload)">
                <operateButtonOption
                  :disabled="isReview"
                  @click="restart"
                >
                  Rebuild
                </operateButtonOption>
              </template>
              <operateButtonOption
                :disabled="isReview"
                @click="deleteItem"
              >
                Delete
              </operateButtonOption>
              <operateButtonOption
                v-if="['deployments', 'statefulsets', 'daemonsets', 'cronjobs', 'configmaps', 'secrets', 'services', 'ingresses'].includes(workload)"
                :disabled="isReview"
                @click="editItem"
              >
                Set up
              </operateButtonOption>
              <template v-if="workload === 'persistentvolumeclaims'">
                <operateButtonOption
                  :disabled="isReview || (instanceInfo && instanceInfo.status.phase !== 'Bound')"
                  @click="editYAML"
                >
                  YAML settings
                </operateButtonOption>
              </template>
              <operateButtonOption
                v-else
                :disabled="isReview"
                @click="editYAML"
              >
                YAML settings
              </operateButtonOption>
            </template>
            <template v-else>
              <operateButtonOption
                :disabled="isReview"
                @click="deleteItem"
              >
                Delete
              </operateButtonOption>
            </template>
          </operateList>
        </div>
      </headCard>
      <x-request
        ref="request"
        :service="service"
        :params="requestParam"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading, error }">
          <i
            v-if="loading"
            class="el-icon-loading"
            style="font-size: 24px"
          />
          <div v-else-if="error">
            Loading error!
          </div>
          <template v-else-if="withInstanceTransparent">
            <router-view :instance="data" />
          </template>
          <template v-else>
            <el-tabs
              :value="routeName"
              page="main"
              @tab-click="(pane) => handleTabClick(pane, getTabs(data))"
            >
              <el-tab-pane
                v-for="(item, index) in getTabs(data)"
                :key="index"
                :label="item.title"
                :name="item.route.name"
              />
            </el-tabs>
            <!-- <u-tabs router>
              <u-tab
                v-for="(item, index) in getTabs(data)"
                :key="index"
                :value="item"
                :title="item.title"
                :to="item.route"
              />
            </u-tabs> -->
            <router-view :instance="data" />

            <modify-replicas-dialog
              ref="modifyDialog"
              :instance="data"
              @refresh="refresh"
            />
          </template>
        </template>
      </x-request>
    </template>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toDepPlainObject,
} from 'kubeworkz/k8s-resources/deployment/index.js';
import {
    toPlainObject as toStatefulsetPlainObject,
} from 'kubeworkz/k8s-resources/statefulset/index.js';
import {
    toPlainObject as toDaemonsetPlainObject,
} from 'kubeworkz/k8s-resources/daemonsets/index.js';
import {
    toPlainObject as toJobPlainObject,
} from 'kubeworkz/k8s-resources/job/index.js';
import {
    toPlainObject as toCronJobPlainObject,
} from 'kubeworkz/k8s-resources/cronjob';
import {
    toPlainObject as toPodPlainObject,
} from 'kubeworkz/k8s-resources/pod/index.js';
import {
    toPlainObject as toServicePlainObject,
} from 'kubeworkz/k8s-resources/service/index.js';
import {
    toPlainObject as toIngressPlainObject,
} from 'kubeworkz/k8s-resources/ingress';
import {
    toPlainObject as toPVCPlainObject,
} from 'kubeworkz/k8s-resources/persistentvolumeclaim';
import {
    toPlainObject as toConfigmapPlainObject,
} from 'kubeworkz/k8s-resources/configmap';
import {
    toPlainObject as toSecretPlainObject,
} from 'kubeworkz/k8s-resources/secret';
import {
    toPlainObject as toPrometheusRulePlainObject,
} from 'kubeworkz/k8s-resources/prometheusRule';
import {
    rulespecCRD,
} from 'kubeworkz/views/control/observable/utils.js';
import modifyReplicasDialog from './dialog/modify-replicas.vue';
import logseerService from 'kubeworkz/services/logseer';
import {
    toPlainObject as toLogconfgPlainObject,
} from 'kubeworkz/k8s-resources/logconfigs-new';
export default {
    metaInfo() {
        return {
            title: `${this.name} - kubeworkz`,
        };
    },
    components: {
        modifyReplicasDialog,
    },
    computed: {
        namespace: get('scope/namespace@value'),
        projectNamespace: get('scope/project@spec.namespace'),
        cluster: get('scope/cluster@value'),
        userRole: get('scope/userRole'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            const keyMap = {
                deployments: 'deployments',
                statefulsets: 'statefulsets',
                daemonsets: 'daemonsets',
                jobs: 'jobs',
                cronjobs: 'cronjobs',
                pods: 'pods',
                services: 'services',
                ingresses: 'ingresses',
                loadbalancer: 'loadbalancers',
                persistentvolumeclaims: 'persistentvolumeclaims',
                secrets: 'secrets',
                configmaps: 'configmaps',
            };
            return !this.userResourcesPermission[keyMap[this.workload]];
        },
        name() {
            return this.$route.params.instance;
        },
        workload() {
            return this.$route.params.workload;
        },
        service() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.getInstance;
                case 'jobs':
                    return workloadService.getBatchInstance;
                case 'cronjobs':
                    return workloadService.getBatchsBetaInstance;
                case 'pods':
                case 'services':
                case 'persistentvolumeclaims':
                case 'secrets':
                case 'configmaps':
                    return workloadService.getAPIV1Instance;
                case 'ingresses':
                    return workloadService.getNetworkingInstance;
                case 'logconfigs':
                    return logseerService.getLogconfigInstance;
                case 'PrometheusRule':
                    return workloadService.getNamespaceCRResourceInstance;
                default:
                    return null;
            }
        },
        deleteService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.deleteInstance;
                case 'jobs':
                    return workloadService.deleteBatchInstance;
                case 'cronjobs':
                    return workloadService.deleteBatchsBetaInstance;
                case 'pods':
                case 'services':
                case 'persistentvolumeclaims':
                case 'secrets':
                case 'configmaps':
                    return workloadService.deleteAPIV1Instance;
                case 'ingresses':
                    return workloadService.deleteNetworkingInstance;
                case 'logconfigs':
                    return logseerService.deleteLogconfig;
                default:
                    return null;
            }
        },
        modifyService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.modifyWorkload;
                case 'jobs':
                    return workloadService.modifyBatchInstance;
                case 'cronjobs':
                    return workloadService.modifyBatchsBetaInstance;
                case 'pods':
                case 'services':
                case 'persistentvolumeclaims':
                case 'secrets':
                case 'configmaps':
                    return workloadService.modifyAPIV1Instance;
                case 'ingresses':
                    return workloadService.modifyNetworkingInstance;
                case 'logconfigs':
                    return workloadService.modifyKubeworkzResource;
                default:
                    return null;
            }
        },
        requestParam() {
            if (this.workload === 'PrometheusRule') {
                return {
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.projectNamespace,
                        name: this.name,
                        ...rulespecCRD,
                    },
                };
            }
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.name,
                },
            };
        },
        needTransparent() {
            return this.$route.name === 'control.workload.containerdetail';
        },
        withInstanceTransparent() {
            return this.$route.name === 'control.workload.edit' || this.$route.name === 'control.workload.updateImage';
        },
        routeName() {
            return this.$route.name;
        },
    },
    methods: {
        handleTabClick(pane, tabs) {
            const target = tabs.find(item => item.route.name === pane.name);
            this.$router.push(target.route);
        },
        toUpdateImage(name) {
            this.$router.push({
                path: `/control/${this.workload}/${name}/updateImage`,
            });
        },
        async restart() {
            await workloadService.patchWorkload({
                pathParams: {
                    ...this.requestParam.pathParams,
                    name: this.name,
                },
                data: {
                    spec: {
                        template: {
                            metadata: {
                                annotations: {
                                    'kubectl.kubernetes.io/restartedAt': `${new Date().toLocaleString()}`,
                                },
                            },
                        },
                    },
                },
            });
            this.$message({
                message: 'Rebuild triggered',
                type: 'success',
            });
            this.refresh();
        },
        resolver(response) {
            console.log(response);
            switch (this.workload) {
                case 'deployments':
                    return toDepPlainObject(response);
                case 'statefulsets':
                    return toStatefulsetPlainObject(response);
                case 'daemonsets':
                    return toDaemonsetPlainObject(response);
                case 'jobs':
                    return toJobPlainObject(response);
                case 'cronjobs':
                    return toCronJobPlainObject(response);
                case 'pods':
                    return toPodPlainObject(response);
                case 'services':
                    return toServicePlainObject(response);
                case 'ingresses':
                    return toIngressPlainObject(response);
                case 'persistentvolumeclaims':
                    return toPVCPlainObject(response);
                case 'secrets':
                    return toSecretPlainObject(response);
                case 'configmaps':
                    return toConfigmapPlainObject(response);
                case 'logconfigs':
                    return toLogconfgPlainObject(response);
                case 'PrometheusRule':
                    return toPrometheusRulePlainObject(response);
                default:
                    return null;
            }
        },
        getTabs(data) {
            switch (this.workload) {
                case 'pods':
                    return [
                        { title: 'Details', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: 'Monitor', route: { name: 'control.workload.monitor', params: this.$route.params } },
                        { title: 'Event', route: { name: 'control.workload.event', params: this.$route.params } },
                        { title: 'Condition information', route: { name: 'control.workload.condition', params: this.$route.params } },
                        { title: 'Log', route: { name: 'control.workload.log', params: this.$route.params } },
                    ];
                case 'cronjobs':
                    return [
                        { title: 'Details', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: 'Task list', route: { name: 'control.workload.jobs', params: this.$route.params } },
                        { title: 'Event', route: { name: 'control.workload.event', params: this.$route.params } },
                    ];
                case 'services':
                    if ([ 'normal', 'nodePort', 'loadBalancer' ].includes(data.spec.template)) {
                        return [
                            { title: 'Details', route: { name: 'control.workload.info', params: this.$route.params } },
                            { title: 'Event', route: { name: 'control.workload.event', params: this.$route.params } },
                            { title: 'External service port', route: { name: 'control.workload.external', params: this.$route.params } },
                        ];
                    }
                    return [
                        { title: 'Details', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: 'Event', route: { name: 'control.workload.event', params: this.$route.params } },
                    ];
                case 'ingresses':
                    return [
                        { title: 'Details', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: 'Event', route: { name: 'control.workload.event', params: this.$route.params } },
                    ];
                case 'persistentvolumeclaims':
                    return [
                        { title: 'Details', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: 'Monitor', route: { name: 'control.workload.monitor', params: this.$route.params } },
                    ];
                case 'secrets':
                case 'configmaps':
                case 'logconfigs':
                    return [
                        { title: 'Details', route: { name: 'control.workload.info', params: this.$route.params } },
                    ];
                default:
                    return [
                        { title: 'Details', route: { name: 'control.workload.info', params: this.$route.params } },
                        { title: 'Pod', route: { name: 'control.workload.pod', params: this.$route.params } },
                        { title: 'Monitor', route: { name: 'control.workload.monitor', params: this.$route.params } },
                        { title: 'Event', route: { name: 'control.workload.event', params: this.$route.params } },
                        { title: 'Condition information', route: { name: 'control.workload.condition', params: this.$route.params } },
                        { title: 'Log', route: { name: 'control.workload.log', params: this.$route.params } },
                        // { title: 'Auto scaling', path: `/${moduleName}/detail/HPA` },
                        // { title: 'Performance analysis', crd: 'abnormals.diagnosis.kubeworkz.com', path: `/${moduleName}/detail/performance` },
                        // { title: 'Resource recommendations', crd: 'verticalpodautoscalers.autoscaling.k8s.io', path: `/${moduleName}/detail/recommand` },
                    ];
            }
        },
        refresh() {
            this.$refs.request.request();
        },
        toResize() {
            this.$refs.modifyDialog.open();
        },
        async editYAML() {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.name,
                },
            };
            const response = await this.service(reqParam);

            this.$editResource({
                title: `${this.name} —— YAML settings`,
                content: response,
                onSubmit: async content => {
                    console.log(content);
                    await this.modifyService({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
        editItem() {
            this.$router.push({
                path: `/control/${this.workload}/${this.name}/edit`,
            });
        },
        deleteItem() {
            this.$eConfirm({
                title: 'Delete',
                message: `Confirm to delete ${this.name}?`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: this.workload,
                            name: this.name,
                        },
                    };
                    await this.deleteService(reqParam);
                    this.$router.push({
                        path: `/control/${this.workload}/list`,
                    });
                },
            });
        },
    },
};
</script>

<style>

</style>
