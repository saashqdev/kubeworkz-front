<template>
  <div>
    <el-link
      :disabled="disabled"
      type="primary"
      :underline="false"
      @click="handleImport"
    >
      Import existing workload tags
    </el-link>
    <labelEditor
      v-model="localLabels"
      prefix-prop="labelSelector"
      :required="true"
      :disabled="disabled"
    />
    <el-dialog
      title="Hint"
      :visible.sync="dialogVisible"
    >
      <el-form
        label-position="right"
        label-width="120px"
      >
        <el-form-item label="Workload">
          <el-select
            v-model="form.workload"
            placeholder="Please select a workload"
          >
            <el-option-group
              label="deployment"
            >
              <el-option
                v-for="item in deployments"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-option-group>
            <el-option-group
              label="statefulset"
            >
              <el-option
                v-for="item in statefulsets"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
        >OK</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import labelEditor from 'kubeworkz/elComponent/label-editor.vue';
import workloadService from 'kubeworkz/services/k8s-resource';
import { get as getFun } from 'lodash';
import {
    toObjectArray,
} from 'kubeworkz/k8s-resources/base.js';
export default {
    components: {
        labelEditor,
    },
    props: {
        value: {
            type: Array,
            default: () => ([]),
        },
        cluster: {
            type: String,
            default: '',
        },
        namespace: {
            type: String,
            default: '',
        },
        prefixProp: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            localLabels: this.value,
            dialogVisible: false,
            form: {
                workload: '',
            },
            deployments: [],
            statefulsets: [],
        };
    },
    watch: {
        value(val) {
            this.localLabels = val;
        },
        localLabels(val) {
            this.$emit('input', val);
        },
    },
    methods: {
        handleImport() {
            this.form.workload = '';
            this.dialogVisible = true;
            this.loadDeployments();
            this.loadStatefulsets();
        },
        async loadDeployments() {
            const res = await workloadService.getWorkloads({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'deployments',
                },
                params: {
                    pageSize: 9999,
                },
            });
            this.deployments = (res.items || []).map(item => {
                return {
                    text: getFun(item, 'metadata.name'),
                    value: `deployment$${getFun(item, 'metadata.name')}`,
                    matchLabels: toObjectArray(getFun(item, 'spec.selector.matchLabels'), 'key', 'value'),
                };
            });
        },
        async loadStatefulsets() {
            const res = await workloadService.getWorkloads({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'statefulsets',
                },
                params: {
                    pageSize: 9999,
                },
            });
            this.statefulsets = (res.items || []).map(item => {

                return {
                    text: getFun(item, 'metadata.name'),
                    value: `statefulset$${getFun(item, 'metadata.name')}`,
                    matchLabels: toObjectArray(getFun(item, 'spec.selector.matchLabels'), 'key', 'value'),
                };
            });
        },
        handleSubmit() {
            const target = [ ...this.deployments, ...this.statefulsets ].find(item => item.value === this.form.workload);
            this.localLabels = target.matchLabels;
            this.dialogVisible = false;
        },
    },
};
</script>
