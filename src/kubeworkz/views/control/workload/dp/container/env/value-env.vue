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
          dataIndex: 'value'
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
      <template #value="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.value`"
          :rules="[
            validators.consistofUnicode(false),
            validators.lengthBetween(0, 2048, false),
          ]"
        >
          <el-input
            v-model="record.value"
            placeholder="0-2048 ASCII characters"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
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
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-value-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
            };
        },
    },
};
</script>

<style>

</style>
