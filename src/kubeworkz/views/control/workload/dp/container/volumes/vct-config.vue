<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :columns="[
        {
          title: 'Mount directory',
          dataIndex: 'mountPath',
        },
        {
          title: 'Parameter',
          dataIndex: 'name'
        }
      ]"
    >
      <template #mountPath="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.mountPath`"
          :rules="[
            validators.startsWithSlash(false),
            validators.consistofPath(false),
            validators.noRedundance(allMountPath, false)
          ]"
        >
          <el-input
            v-model="record.mountPath"
          />
        </el-form-item>
      </template>
      <template #name="{record}">
        <el-select
          v-model="record.name"
          placeholder="Please choose"
          filterable
          size="huge"
        >
          <el-option
            v-for="item in vcts"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    props: {
        storage: Array,
    },
    data: () => ({
        validators,
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-vct-`;
        },
        vcts() {
            return this.storage.map(v => ({
                text: v.name,
                value: v.name,
            }));
        },
    },
    methods: {
        getDataTemplate() {
            return {
                name: '',
                mountPath: '',
            };
        },
    },
};
</script>

<style>

</style>
