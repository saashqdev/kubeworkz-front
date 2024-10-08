<template>
  <el-dialog
    :title="type === 'create' ? 'Create namespace' : 'Modify namespace'"
    :visible.sync="show"
    width="900px"
    :close-on-click-modal="false"
    @close="close"
  >
    <kube-pipe
      v-if="show"
      graph="tenant > project"
      @pipestatechange="pipeLoading = $event"
    >
      <el-form
        ref="form"
        :model="model"
        label-position="right"
        label-width="120px"
      >
        <el-form-item
          label="Cluster"
          prop="pipe.cluster"
          :rules="[
            validators.required(),
          ]"
        >
          <cluster-select
            v-model="model.pipe.cluster"
            :disabled="isEdit"
            no-title
          />
        </el-form-item>
        <el-form-item
          label="Namespace name"
          prop="pipe.namespace"
          :rules="[
            validators.required(),
            validators.k8sResourceNameValidator(),
          ]"
        >
          <el-input
            v-model="model.pipe.namespace"
            :disabled="isEdit"
            placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
          />
        </el-form-item>
        <el-form-item
          label="Tenant"
          prop="pipe.tenant"
          :rules="[
            validators.required(),
          ]"
        >
          <tenantSelect
            v-model="model.pipe.tenant"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item
          label="Related projects"
          prop="pipe.project"
          :rules="[
            validators.required(),
          ]"
        >
          <project-select
            v-model="model.pipe.project"
            :disabled="isEdit"
            auth="writable"
            no-empty
            :tenant="model.pipe.tenant && model.pipe.tenant.value"
          />
        </el-form-item>
        <x-request
          v-if="model.pipe.cluster && model.pipe.tenant && resourceLoaded"
          ref="request"
          :service="quotaService"
          :params="params"
          :processor="resolver"
        >
          <template slot-scope="{ loading }">
            <el-form-item
              label="Computing resources"
            >
              <template v-if="model.pipe.cluster && model.pipe.tenant">
                <i
                  v-if="loading"
                  class="el-icon-loading"
                  style="font-size: 24px"
                />
                <hardQuota
                  v-else
                  v-model="model.resource"
                  prefix-prop="resource"
                  :availables="availables"
                />
              </template>
            </el-form-item>
            <el-form-item
              label="Storage resources"
              prop="resource.spec.hard.storage"
              :rules="[
                validators.required(),
                validators.consistofNumber(),
                validators.numberBetween(0, availables.storage),
              ]"
            >
              <el-input
                v-model="model.resource.spec.hard.storage"
                style="width: 200px"
              />
              <span style="line-height:32px;margin-left:8px">GiB</span>
            </el-form-item>
          </template>
        </x-request>
      </el-form>
    </kube-pipe>
    <div slot="footer">
      <el-button @click="close">
        Cancel
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="submit"
      >
        OK
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import BigNumber from 'bignumber.js';
import { Modal } from '@micro-app/common/mixins';
import {
    toPlainObject as toResourceQuotaPlainObject,
    patchK8SObject as patchResourceQuotaPK8SObject,
} from 'kubeworkz/k8s-resources/resourceQuota/index.js';
import clusterSelect from './cluster-select.vue';

import {
    toPlainObject as toKubeResourceQoutaPlainObject,
} from 'kubeworkz/k8s-resources/kubeResourceQuota/index.js';
import tenantSelect from 'kubeworkz/elComponent/global/tenant-select.vue';
import projectSelect from 'kubeworkz/elComponent/global/project-select.vue';
import scopeService from 'kubeworkz/services/scope';
import workloadService from 'kubeworkz/services/k8s-resource';
import userService from 'kubeworkz/services/user';
import hardQuota from './el-ns-quota-table.vue';
import { getNodeInfo } from 'kubeworkz/utils/functional';
import { get } from 'vuex-pathify';
import * as validators from 'kubeworkz/utils/validators';
import {
    toK8SObject as toSubnamespaceK8SObject,
} from 'kubeworkz/k8s-resources/subnamespace';

export default {
    components: {
        clusterSelect,
        tenantSelect,
        projectSelect,
        hardQuota,
    },
    mixins: [ Modal ],
    props: {
        tenant: Object,
    },

    data() {
        return {
            model: {
                pipe: {
                    namespace: '',
                    cluster: null,
                    tenant: null,
                    project: null,
                    type: 'shared',
                    region: '',
                    zone: '',
                },
                resource: toResourceQuotaPlainObject(),
            },
            quotaService: scopeService.getKubeQuotaResourceInstance,
            resourceLoaded: false,
            type: 'create',
            availables: {
                cpu: 0,
                limitsCpu: 0,
                memory: 0,
                limitsMemory: 0,
                gpu: 0,
            },
            resource: toResourceQuotaPlainObject(),
            pipe: {
                namespace: '',
                cluster: null,
                tenant: null,
                project: null,
                type: 'shared',
                region: '',
                zone: '',
            },
            usedNodes: [],
            remainNodes: [],
            nodeServer: workloadService.getResourceListWithoutNamespace,
            validators,
            allNodes: [],
            selectedNodes: [],
            submitting: false,
        };
    },
    computed: {
        isEdit() {
            return this.type === 'edit';
        },
        params() {
            return {
                pathParams: {
                    cluster: this.controlClusterList[0].clusterName,
                    name: `${this.model.pipe.cluster.value}.${this.model.pipe.tenant.value}`,
                },
            };
        },
        nodeParams() {
            return {
                pathParams: {
                    cluster: this.model.pipe.cluster.value,
                    resource: 'nodes',
                },
                params: {
                    pageNum: 1,
                    pageSize: 9999,
                    selector: `metadata.labels.node.kubeworkz.io/tenant=${this.model.pipe.tenant.value}`,
                },
            };
        },
        // Resource information of the selected node (total data of cpu, memory, and gpu)
        usedNodeInfo() {
            return getNodeInfo(this.allNodes.filter(item => this.selectedNodes.includes(item.key)));
        },
        // Resource information of selectable nodes (total data of cpu, memory, and gpu)
        remainNodeInfo() {
            return getNodeInfo(this.allNodes.filter(item => !this.selectedNodes.includes(item.key)));
        },
        controlClusterList: get('scope/controlClusterList'),
        // availables() {
        //     const item = this.pipe.cluster;
        //     return {
        //         cpu: item.totalCpu - item.usedCpu,
        //         memory: item.totalMem - item.usedMem,
        //         gpu: item.totalGpu - item.usedGpu,
        //         storage: item.totalStorage - item.usedStorage,
        //     };
        // },
    },
    // watch: {
    //     tenant(val) {
    //         this.pipe.tenant = val ? pick(val, [ 'value' ]) : null;
    //     },
    // },
    methods: {
        handleValidate() {
            this.$refs.observer.validate();
        },
        resolver(kubeQuotaResponse) {
            // this.type = response ? 'edit' : 'create';
            if (!this.isEdit) {
                this.model.resource = toResourceQuotaPlainObject();
            }
            const quota = toKubeResourceQoutaPlainObject(kubeQuotaResponse);
            Object.assign(this.availables, {
                cpu: +new BigNumber(quota.status.hard.cpu).minus(quota.status.used.cpu).plus(this.model.resource.spec.hard.cpu), // - unitConvertCPU(clusterQuota.assignedCpu),
                limitsCpu: +new BigNumber(quota.status.hard.limitsCpu).minus(quota.status.used.limitsCpu).plus(this.model.resource.spec.hard.limitsCpu),
                memory: +new BigNumber(quota.status.hard.memory).minus(quota.status.used.memory).plus(this.model.resource.spec.hard.memory), // - unitConvertMemory(clusterQuota.assignedMem),
                limitsMemory: +new BigNumber(quota.status.hard.limitsMemory).minus(quota.status.used.limitsMemory).plus(this.model.resource.spec.hard.limitsMemory),
                gpu: +new BigNumber(quota.status.hard.gpu).minus(quota.status.used.gpu).plus(this.model.resource.spec.hard.gpu), // - unitConvertCPU(clusterQuota.assignedGpu),
                storage: +new BigNumber(quota.status.hard.storage).minus(quota.status.used.storage).plus(this.model.resource.spec.hard.storage),
                // storage: item.totalStorage - item.usedStorage,
            });
        },
        async open(item) {
            this.show = true;
            this.resourceLoaded = false;
            if (item) {
                Object.assign(this.model.pipe, {
                    namespace: item.namespace,
                    cluster: { value: item.cluster },
                    project: { value: item.project },
                    type: item.type,
                    tenant: { value: item.tenant },
                });
                const response = await workloadService.getAPIV1Instance({
                    pathParams: {
                        cluster: item.cluster,
                        namespace: item.namespace,
                        resource: 'resourcequotas',
                        name: `${item.cluster}.${item.tenant}.${item.project}.${item.namespace}`,
                    },
                });
                this.model.resource = toResourceQuotaPlainObject(response);
                this.resourceLoaded = true;
                this.type = 'edit';
            } else {
                this.model.resource = toResourceQuotaPlainObject();
                this.model.pipe.namespace = '';
                this.resourceLoaded = true;
                this.type = 'create';
            }

        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            try {
                this.submitting = true;
                const cluster = this.model.pipe.cluster.value;
                const namespace = this.model.pipe.namespace;
                const tenant = this.model.pipe.tenant.value;
                const project = this.model.pipe.project.value;
                const projectNs = this.model.pipe.project.spec.namespace;
                if (this.type === 'edit') {
                    // Update ResourceQuota
                    const quota = patchResourceQuotaPK8SObject(
                        this.model.resource
                    );
                    await workloadService.patchAPIV1Instance({
                        pathParams: {
                            cluster,
                            namespace,
                            resource: 'resourcequotas',
                            name: `${cluster}.${tenant}.${project}.${namespace}`,
                        },
                        data: quota,
                    });
                    this.show = false;
                    this.$emit('refresh', tenant);
                } else {
                    const quota = patchResourceQuotaPK8SObject(
                        this.model.resource
                    );
                    const subnamespaceYaml = toSubnamespaceK8SObject({
                        namespace,
                        tenant,
                        project,
                        scope: projectNs,
                    });

                    const quotaYaml = {
                        apiVersion: 'v1',
                        kind: 'ResourceQuota',
                        metadata: {
                            name: `${cluster}.${tenant}.${project}.${namespace}`,
                            namespace,
                            labels: {
                                'kubeworkz.io/quota': `${cluster}.${tenant}`,
                                'kubeworkz.io/cluster': cluster,
                                'kubeworkz.io/tenant': tenant,
                                'kubeworkz.io/project': project,
                            },
                        },
                        ...quota,
                    };
                    await userService.createNSQuota({
                        data: {
                            cluster,
                            subNamespaceAnchor: subnamespaceYaml,
                            resourceQuota: quotaYaml,
                        },
                    });
                    this.show = false;
                    this.$emit('refresh', this.model.pipe.tenant.value);
                }
            } catch (error) {
                console.log(error);
            }
            this.submitting = false;

        },
    },
};
</script>

<style module>
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubeworkz/assets/question.svg');
    cursor: pointer;
}
.table td,
.table th{
    text-align: center;
}
.table td:nth-child(3n+1),
.table th:nth-child(3n+1){
    text-align: left;
}
.thead{
    background-color: #f5f7fa;
    background-clip: padding-box;
    border-bottom: 1px solid #ebf0f5;
}
tr.thead > th {
    vertical-align: middle;
    box-sizing: border-box;
    padding: 13px 10px;
    line-height: 20px;
    text-align: left;
    font-weight: 400;
}
.inlineflex {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}
.inlineflex > * {
    margin-left: .75em;
}
.required{
    position: relative;
}
.required::after {
    content: '*';
    color: red;
    position: absolute;
    right: -.5em;
    height: 12px;
    line-height: 12px;
    top: 0px;
}
.unit {
    width: 40px;
}
.inputs {
    width: 120px;
    float:right
}

.adjustTransfer ul[class] {
    width: 260px;
    overflow: auto;
}
.adjustTransfer ul[class] li[disabled] {
    color: #999;
}
.nodeStat {
    margin-bottom: 5px;
}
.nodeStat div {
    display: inline-block;
    width: 260px;
}
.nodeStat div:first-child {
    margin-right: 54px;
    vertical-align: top;
}
.assign[low] {
    color: $brand-error;
}
.transferWrap :global(.el-transfer-panel) {
  width: 320px;
}
.tabsWrap :global(.el-tabs__header) {
    margin: 0 !important;
}
</style>
