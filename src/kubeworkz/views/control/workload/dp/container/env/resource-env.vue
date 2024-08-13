<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :columns="[
        {
          title: 'Key',
          dataIndex: 'key',
        },
        {
          title: 'Resource',
          dataIndex: 'resource',
        },
        {
          title: 'ResourceKey',
          dataIndex: 'resoueceKey'
        },
      ]"
    >
      <template #key="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.key`"
          :rules="[
            validators.startsWithLetter(false),
            validators.consistofLetterNumbersUnderscores(false),
            validators.noRedundance(existKeys, false),
            validators.lengthBetween(1, 64, false),
          ]"
        >
          <el-input
            v-model="record.key"
            placeholder="Composed of 1-64 letters, numbers or underscores, starting with a letter"
          />
        </el-form-item>
      </template>
      <template #resource="{record}">
        <el-select
          v-model="record.resource"
          placeholder="Please choose"
          filterable
        >
          <el-option
            v-for="item in containerNames"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </template>
      <template #resoueceKey="{record}">
        <el-select
          v-model="record.resoueceKey"
          placeholder="Please choose"
        >
          <el-option
            v-for="item in RESOURCE_DATA"
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
import envMixin from './env.mixin';
import { RESOURCE_DATA } from 'kubeworkz';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ envMixin ],
    props: {
        containers: Array,
        existKeys: {
            type: Array,
            default: () => [],
        },
    },
    data: () => ({
        validators,
        RESOURCE_DATA: RESOURCE_DATA.map(k => ({ text: k, value: k })),
    }),
    computed: {
        containerNames() {
            return this.containers.filter(c => c.containerName).map(c => ({
                text: c.containerName,
                value: c.containerName,
            }));
        },
        errorprefix() {
            return `${this.prefixKey}-env-resource-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                resource: '',
                resoueceKey: '',
            };
        },
    },
};
</script>

<style>

</style>
