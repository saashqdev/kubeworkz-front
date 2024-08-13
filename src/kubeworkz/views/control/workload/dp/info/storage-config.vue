<template>
  <el-form-item
    label="Storage"
  >
    <el-switch
      v-model="model.enable"
      :disabled="isEdit"
    />
    <template v-if="model.enable">
      <x-request
        ref="request"
        style="margin-top: 10px"
        :service="storageService"
        :params="requestParam"
        :processor="storageResolver"
      >
        <template slot-scope="{ data, loading }">
          <i
            v-if="loading"
            class="el-icon-loading"
            style="font-size:24px"
          />
          <template v-else>
            <dynamicCard
              v-model="model.templates"
              validate-file="spec.volumeClaimTemplates.templates"
              :get-default-item="getDataTemplate"
              :initial-add="true"
              :min-count="1"
              add-button-text="Add declaration template"
              :disabled="isEdit"
              :mini-formatter="(item, index) => {
                return `Configuration - ${index + 1}`
              }"
            >
              <template slot-scope="{item, index}">
                <el-form-item
                  label="Storage class"
                  :prop="`spec.volumeClaimTemplates.templates.${index}.storageClassName`"
                  :rules="[
                    { required: true, message: 'Storage class cannot be empty'},
                  ]"
                  style="margin-bottom: 22px;"
                >
                  <el-select
                    v-model="item.storageClassName"
                    :disabled="isEdit"
                  >
                    <el-option
                      v-for="optionItem in data"
                      :key="optionItem.value"
                      :label="optionItem.text"
                      :value="optionItem.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="Name"
                  :prop="`spec.volumeClaimTemplates.templates.${index}.name`"
                  :rules="[
                    { required: true, message: 'Name is required'},
                    validators.k8sResourceNameValidator(),
                  ]"
                  style="margin-bottom: 22px;"
                >
                  <el-input
                    v-model="item.name"
                    :disabled="isEdit"
                    placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
                  />
                </el-form-item>
                <el-form-item
                  label="Capacity"
                  style="margin-bottom: 22px;"
                >
                  <el-input-number
                    v-model="item.storage"
                    :min="1"
                    controls-position="right"
                    style="width: 300px;"
                    :disabled="isEdit"
                  />
                  <span style="margin-left:8px">GiB</span>
                </el-form-item>
                <el-form-item
                  label="Model"
                  style="margin-bottom: 22px;"
                >
                  <el-select
                    v-model="item.accessModes"
                    :disabled="isEdit"
                  >
                    <el-option
                      v-for="optionItem in PVC_MODES"
                      :key="optionItem.value"
                      :label="optionItem.text"
                      :value="optionItem.value"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </dynamicCard>
          </template>
        </template>
      </x-request>
    </template>
  </el-form-item>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import {
    setValueIfListNotPresent,
} from 'kubeworkz/utils/functional';
import { PVC_MODE_MAP } from 'kubeworkz';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            validators,
            storageService: workloadService.getStorage,
            PVC_MODES: Object.keys(PVC_MODE_MAP).map(key => ({
                text: PVC_MODE_MAP[key],
                value: key,
            })),
            defaultStorage: null,
        };
    },
    computed: {
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'storageclasses',
                },
                params: {
                    pageSize: 10000,
                },
            };
        },
    },
    methods: {
        getDataTemplate() {
            return {
                accessModes: 'ReadWriteOnce',
                storageClassName: this.defaultStorage,
                name: '',
                storage: 1,
            };
        },
        storageResolver(response) {
            const items = (response.items || []).map(t => ({
                text: t.metadata.name,
                value: t.metadata.name,
                ...t,
            }));
            setValueIfListNotPresent({
                list: items,
                path: 'value',
                current: this.defaultStorage,
            }, val => {
                this.defaultStorage = getFunc(val, 'value');
            });
            return items;
        },
    },
};
</script>

<style>

</style>
