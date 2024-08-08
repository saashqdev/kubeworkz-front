<template>
  <el-dialog
    title="Set taint"
    :visible.sync="show"
    width="640px"
    @close="close"
  >
    <div>Taint (taint), only pods with toleration matching the taint can be assigned to the node.</div>
    <el-form v-if="show" ref="form" :model="model" label-position="right">
      <el-form-item>
        <dynamicBlock
          v-model="model.taints"
          :getDefaultItem="getDataTemplate"
          :columns="[
              {
                  title: 'Key',
                  dataIndex: 'key',
              },
              {
                  title: 'Value',
                  dataIndex: 'value',
              },
              {
                  title: 'Effect',
                  dataIndex: 'effect',
              }
          ]"
        >
          <template slot="th-effect">
            Effect
            <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
              <template slot="content">
                <div>NoSchedule: POD will not be scheduled to nodes marked as taints.</div>
                <div>PreferNoSchedule: Soft policy version of NoSchedule. Try to avoid scheduling pods on nodes that cannot tolerate taint</div>
                <div>NoExecute: This option means that once Taint takes effect, if the POD running in the node does not have a corresponding Tolerate setting, it will be evicted directly.</div>
              </template>
              <i class="el-icon-question"/>
            </el-tooltip>
          </template>

          <template v-slot:key="{record, index}">
            <el-form-item 
              label=""
              :prop="`taints.${index}.key`"
              :rules="[
                validators.keyPattern(false),
                validators.noRedundance(exsitKeys, false),
              ]"
            >
              <el-input
                v-model="record.key"
              />
            </el-form-item>
          </template>
          <template v-slot:value="{record, index}">
              <el-input
                v-model="record.value"
              />
          </template>
          <template v-slot:effect="{record, index}">
            <el-select
              v-model="record.effect"
              placeholder="Please choose"
              filterable
            >
              <el-option
                v-for="item in effects"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </template>
        </dynamicBlock>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" @click="submit" :loading="submitLoading">OK</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { get, cloneDeep, set } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubeworkz/services/k8s-resource';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            effects: [ 'NoSchedule', 'PreferNoSchedule', 'NoExecute' ].map(item => ({ text: item, value: item })),
            model: {
                taints: [],
            },
            test: [],
            raw: null,
            validators,
            submitLoading: false,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.taints.map(t => t.key);
        },
    },
    methods: {
        open(item) {
            const taints = get(item, 'spec.taints', []);
            this.model.taints = cloneDeep(taints);
            this.raw = item;
            this.show = true;
        },
        getDataTemplate() {
            return {
                key: '',
                value: '',
                effect: 'NoSchedule',
            };
        },
        async submit() {
            // Trigger verification
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.submitLoading = true;
            try {
                const data = await workloadService.getResourceWithoutNamespace({
                    pathParams: {
                        cluster: this.instance.clusterName,
                        resource: 'nodes',
                        name: get(this.raw, 'metadata.name'),
                    },
                });
                set(data, 'spec.taints', this.model.taints.filter(item => item.key && item.value));
                await workloadService.updateResourceWithoutNamespace({
                    pathParams: {
                        cluster: this.instance.clusterName,
                        resource: 'nodes',
                        name: get(this.raw, 'metadata.name'),
                    },
                    data,
                });
                this.show = false;
                this.$emit('refresh');
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style>

</style>
