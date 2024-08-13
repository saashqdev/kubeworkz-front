<template>
  <kube-pipe
    ref="pipe"
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
          auth="writable"
          no-empty
          :tenant="model.pipe.tenant && model.pipe.tenant.value"
        />
      </el-form-item>
      <x-request
        v-if="model.pipe.cluster && model.pipe.tenant"
        ref="request"
        :service="quotaService"
        :params="params"
        :processor="resolver"
      >
        <template slot-scope="{ loading }">
          <el-form-item
            label="Computing resources"
          >
            <i
              v-if="loading"
              class="el-icon-loading"
              style="font-size: 24px"
            />
            <hardQuota
              v-else
              v-model="model.resource"
              prefix-prop="resource"
              :availables="model.availables"
            />
          </el-form-item>
          <el-form-item
            label="Storage resources"
            prop="resource.spec.hard.storage"
            :rules="[
              validators.required(),
              validators.consistofNumber(),
              validators.numberBetween(0, model.availables.storage),
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
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitting"
          @click="submit"
        >
          Create
        </el-button>
      </el-form-item>
    </el-form>
  </kube-pipe>
</template>

<script>
import {
    toPlainObject as toResourceQuotaPlainObject,
    patchK8SObject as patchResourceQuotaPK8SObject,
} from 'kubeworkz/k8s-resources/resourceQuota/index.js';

import {
    toPlainObject as toCubeResourceQoutaPlainObject,
} from 'kubeworkz';
import {
    toK8SObject as toSubnamespaceK8SObject,
} from 'kubeworkz/k8s-resources/subnamespace';

import clusterSelect from '../namespace/cluster-select.vue';
import scopeService from 'kubeworkz/services/scope';
import hardQuota from '../namespace/el-ns-quota-table.vue';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import * as validators from 'kubeworkz/utils/validators';
import tenantSelect from 'kubeworkz/elComponent/global/tenant-select.vue';
import projectSelect from 'kubeworkz/elComponent/global/project-select.vue';
import BigNumber from 'bignumber.js';
import userService from 'kubeworkz/services/user';

export default {
    components: {
        clusterSelect,
        hardQuota,
        tenantSelect,
        projectSelect,
    },
    mixins: [ makeVModelMixin ],
    props: {
        state: Boolean,
    },
    data() {
        return {
            quotaService: scopeService.getCubeQuotaResourceInstance,
            pipeLoading: false,
            validators,
            submitting: false,
        };
    },
    computed: {
        params() {
            return {
                pathParams: {
                    name: `${this.model.pipe.cluster.value}.${this.model.pipe.tenant.value}`,
                },
            };
        },
    },
    watch: {

        state(val) {
            if (val) {
                this.$refs.pipe.pipeRequest();
            }
        },
    },
    methods: {
        resolver(kubeQuotaResponse) {
            if (!kubeQuotaResponse) {
                this.model.availables = {
                    cpu: 0,
                    limitsCpu: 0,
                    memory: 0,
                    limitsMemory: 0,
                    gpu: 0,
                    storage: 0,
                };
                return;
            }
            this.model.resource = toResourceQuotaPlainObject();
            const quota = toCubeResourceQoutaPlainObject(kubeQuotaResponse);
            Object.assign(this.model.availables, {
                cpu: quota.status.hard.cpu - quota.status.used.cpu, // - unitConvertCPU(clusterQuota.assignedCpu),
                limitsCpu: quota.status.hard.limitsCpu - quota.status.used.limitsCpu,
                memory: quota.status.hard.memory - quota.status.used.memory, // - unitConvertMemory(clusterQuota.assignedMem),
                limitsMemory: quota.status.hard.limitsMemory - quota.status.used.limitsMemory,
                gpu: quota.status.hard.gpu - quota.status.used.gpu, // - unitConvertCPU(clusterQuota.assignedGpu),
                storage: +new BigNumber(quota.status.hard.storage).minus(quota.status.used.storage),
            });
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            const {
                cluster, namespace, tenant, project,
            } = this.model.pipe;
            try {
                this.submitting = true;
                const quota = patchResourceQuotaPK8SObject(
                    this.model.resource
                );
                const subnamespaceYaml = toSubnamespaceK8SObject({
                    namespace,
                    tenant: tenant.value,
                    project: project.value,
                    scope: project.spec.namespace,
                });
                const quotaYaml = {
                    apiVersion: 'v1',
                    kind: 'ResourceQuota',
                    metadata: {
                        name: `${cluster.value}.${tenant.value}.${project.value}.${namespace}`,
                        namespace,
                        labels: {
                            'kubeworkz.io/quota': `${cluster.value}.${tenant.value}`,
                            'kubeworkz.io/cluster': cluster.value,
                            'kubeworkz.io/tenant': tenant.value,
                            'kubeworkz.io/project': project.value,
                        },
                    },
                    ...quota,
                };
                await userService.createNSQuota({
                    data: {
                        cluster: cluster.value,
                        subNamespaceAnchor: subnamespaceYaml,
                        resourceQuota: quotaYaml,
                    },
                });
                this.$toast.success('Created successfully');
                // this.$refs.request.request();
                this.$router.push({
                    path: '/platform/nsquota',
                });
            } catch (error) {
                console.log(error);
            }
            this.submitting = false;

            // const subnamespaceYaml = toSubnamespaceK8SObject({
            //     namespace,
            //     tenant: tenant.value,
            //     project: project.value,
            //     scope: project.spec.namespace,
            // });

            // const quota = toResourceQuotaPK8SObject(
            //     {
            //         cluster: cluster.value,
            //         namespace,
            //         tenant: tenant.value,
            //         project: project.value,
            //     },
            //     this.model.resource
            // );
            // await workloadService.createNamespaceCRResource({
            //     pathParams: {
            //         cluster: cluster.value,
            //         group: 'hnc.x-k8s.io',
            //         version: 'v1alpha2',
            //         plural: 'subnamespaceanchors',
            //         namespace: project.spec.namespace,
            //     },
            //     data: subnamespaceYaml,
            // });

            // await workloadService.createAPIV1Instance({
            //     pathParams: {
            //         cluster: cluster.value,
            //         namespace,
            //         resource: 'resourcequotas',
            //     },
            //     data: quota,
            // });

        },
    },
};
</script>

<style>

</style>
