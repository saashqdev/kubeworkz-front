<template>
  <dynamicBlock
    v-model="model"
    :get-default-item="getDataTemplate"
    :columns="[
      {
        title: '',
        dataIndex: 'path',
      }
    ]"
  >
    <template #path="{record, index}">
      <el-form-item
        :prop="`${prefixProp}.${index}.path`"
        :rules="[
          validators.noRedundance(exsitKeys, false),
          ...(required ? [{ required: true, message: 'Cannot be empty'}] : []),
          ...rules
        ]"
      >
        <el-input
          v-model="record.path"
          :placeholder="placeholder"
        />
      </el-form-item>
    </template>
  </dynamicBlock>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import * as validators from 'kubeworkz/utils/validators';
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block/index.vue';
export default {
    components: {
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    props: {
        errorPrefix: String,
        prefixProp: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: '',
        },
        required: {
            type: Boolean,
            default: false,
        },
        rules: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.path);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                path: '',
            };
        },
    },
};
</script>

<style>

</style>
