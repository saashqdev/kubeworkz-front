<template>
  <div>
    <el-form
      ref="form"
      :model="model"
      :rules="rules"
      label-position="right"
      label-width="160px"
    >
      <el-form-item label="Cluster">
        {{ cluster }}
      </el-form-item>
      <el-form-item label="Namespace">
        {{ namespace }}
      </el-form-item>
      <el-form-item
        label="Name"
        prop="metadata.name"
      >
        <el-input
          v-model="model.metadata.name"
          :disabled="isEdit"
          placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
        />
      </el-form-item>
      <template v-if="workload === 'daemonsets'">
        <el-form-item label="Level">
          <el-radio-group
            v-model="model.spec.level.ind"
            :disabled="isEdit"
          >
            <el-radio label="platform">
              Platform level
            </el-radio>
            <el-radio label="tenant">
              Tenant level
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="model.spec.level.ind === 'tenant'"
          label="Tenant"
          prop="spec.level.tenant"
        >
          <tenant-select
            v-model="model.spec.level.tenant"
            :disabled="isEdit"
          />
        </el-form-item>
      </template>
      <el-form-item
        v-if="!['cronjobs', 'jobs', 'daemonsets'].includes(workload)"
        label="Number of replicas"
      >
        <el-input-number
          v-model="model.spec.replicas"
          controls-position="right"
          :min="0"
          style="width: 300px;"
        />
        <span style="margin-left:8px">Replica</span>
      </el-form-item>
      <template v-if="workload === 'statefulsets'">
        <el-form-item
          label="Service Name"
          prop="spec.serviceName"
        >
          <el-input
            v-model="model.spec.serviceName"
            :disabled="isEdit"
            placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
          />
        </el-form-item>
        <storage-config v-model="model.spec.volumeClaimTemplates" />
      </template>
      <el-form-item label="Time zone synchronization">
        <el-switch v-model="model.timeSync" />
        <span style="margin-left:8px;color:#aaa">After opening, the container and the node use the same time zone (the time zone synchronization function relies on the local disk mounted in the container, please do not modify or delete it)</span>
      </el-form-item>
      <el-form-item
        v-if="['deployments', 'daemonsets'].includes(workload)"
        label=""
      >
        <el-link
          type="primary"
          @click="advanced = !advanced"
        >
          {{ advanced ? 'Close': 'Expand' }} More configurations
        </el-link>
      </el-form-item>
      <update-strategy
        v-if="['deployments', 'daemonsets'].includes(workload) && advanced"
        v-model="model.spec.strategy"
      />
      <el-form-item>
        <el-button
          type="primary"
          @click="handleNextStep"
        >
          Next step
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';

import updateStrategy from './update-strategy.vue';
import storageConfig from './storage-config.vue';
import tenantSelect from './tenant-select.vue';
import * as validators from 'kubeworkz/utils/validators';

export default {
    components: {
        updateStrategy,
        storageConfig,
        tenantSelect,
    },
    mixins: [ makeVModelMixin ],
    data() {
        return {
            advanced: getFunc(this.value, 'spec.strategy.enable'),
            rules: {
                'metadata.name': [
                    { required: true, message: 'Name is required', trigger: 'blur' },
                    validators.k8sResourceNameValidator(),
                ],
                'spec.serviceName': [
                    { required: true, message: 'Service name cannot be empty', trigger: 'blur' },
                    validators.k8sResourceNameValidator(),
                ],
                'spec.level.tenant': [
                    { required: true, message: 'Tenant cannot be empty', trigger: 'blur' },
                ],
                'spec.strategy.minReadySeconds': [
                    validators.consistofNumber(false),
                    validators.numberBetween(5, 300, false),
                ],
                'spec.strategy.maxSurge': [
                    validators.consistofNumberOrPercentage(false),
                ],
                'spec.strategy.maxUnavailable': [
                    validators.consistofNumberOrPercentage(false),
                ],
            },
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
    },
    methods: {
        handleValidate() {
            this.$refs.observer.validate();
        },
        async handleNextStep() {
            // Trigger verification
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.$emit('go', 1);
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

</style>
