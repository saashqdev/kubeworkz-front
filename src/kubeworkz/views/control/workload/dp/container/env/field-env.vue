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
          title: 'Value',
          dataIndex: 'field',
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
      <template #field="{record}">
        <el-select
          v-model="record.field"
          placeholder="Please choose"
          filterable
        >
          <el-option
            v-for="item in FIELD_DATA"
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
import { FIELD_DATA } from 'kubeworkz/utils/constants';
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
    data() {
        return {
            validators,
            FIELD_DATA: FIELD_DATA.map(k => ({ text: k, value: k })),
        };
    },
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-field-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                field: '',
            };
        },
    },
};
</script>

<style>

</style>
