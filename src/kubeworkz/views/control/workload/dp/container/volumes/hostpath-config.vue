<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :columns="[
        {
          title: 'Node path',
          dataIndex: 'path',
        },
        {
          title: 'Model',
          dataIndex: 'pathType'
        },
        {
          title: 'Mount directory',
          dataIndex: 'mountPath'
        }
      ]"
    >
      <template #path="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.path`"
          :rules="[
            validators.startsWithSlash(false),
            validators.consistofPath(false),
          ]"
        >
          <el-input
            v-model="record.path"
          />
        </el-form-item>
      </template>
      <template #pathType="{record}">
        <el-select
          v-model="record.pathType"
          placeholder="Please choose"
          filterable
        >
          <el-option
            v-for="item in pathTypeList"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </template>
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
    </dynamicBlock>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    data: () => ({
        validators,
        resource: 'hostpath',
        pathTypeList: [
            { text: 'DirectoryOrCreate', value: 'DirectoryOrCreate' },
            { text: 'FileOrCreate', value: 'FileOrCreate' },
        ],
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-hostpath-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                path: '',
                mountPath: '',
                pathType: 'DirectoryOrCreate',
            };
        },
    },
};
</script>

<style>

</style>
