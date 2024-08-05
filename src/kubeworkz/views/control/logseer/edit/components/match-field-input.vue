<template>
  <dynamicBlock
    v-model="model"
    :get-default-item="getDataTemplate"
    :columns="[
      {
        title: 'Type',
        dataIndex: 'type',
      },
      {
        title: 'Key',
        dataIndex: 'key',
      }
    ]"
  >
    <template #type="{ record }">
      <el-select
        v-model="record.type"
        placeholder="Please choose"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.text"
          :value="item.value"
        />
      </el-select>
    </template>
    <template #key="{record, index}">
      <el-form-item
        :prop="`${prefixProp}.${index}.path`"
        :rules="[

        ]"
      >
        <el-input
          v-model="record.key"
          placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
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
        rules: Object,
        prefixProp: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
            options: [
                { text: 'label', value: 'labels' },
                { text: 'env', value: 'env' },
                { text: 'annotation', value: 'annotations' },
            ],
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
                type: '',
                key: '',
            };
        },
    },
};
</script>

<style>

</style>
