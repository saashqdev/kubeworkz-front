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
          title: 'Secret',
          dataIndex: 'secret',
        },
        {
          title: 'SecretKey',
          dataIndex: 'secretKey'
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
      <template #secret="{record}">
        <el-select
          v-model="record.secret"
          placeholder="Please choose"
          filterable
        >
          <el-option
            v-for="item in opaqueResources"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </template>
      <template #secretKey="{record}">
        <el-select
          v-model="record.secretKey"
          placeholder="Please choose"
          filterable
        >
          <el-option
            v-for="item in getKeys(record.secret)"
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
// import { keys } from 'lodash';
import envMixin from './env.mixin';
import * as validators from 'kubeworkz/utils/validators';

export default {
    mixins: [ envMixin ],
    props: {
        existKeys: {
            type: Array,
            default: () => [],
        },
    },
    data: () => ({
        validators,
        resource: 'secrets',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-secrets-`;
        },
        opaqueResources() {
            return (this.resources || []).filter(i => i.type === 'Opaque');
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                secret: '',
                secretKey: '',
            };
        },
        // getKeys(value) {
        //     if (!value || !this.resources) return [];
        //     const items = keys(this.resources.find(r => r.value === value).data).map(k => ({
        //         text: k,
        //         value: k,
        //     }));
        //     return items;
        // },
    },
};
</script>

<style>

</style>
