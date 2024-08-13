<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :disabled="disabled"
      :columns="[
        {
          title: 'Port',
          dataIndex: 'port',
        },
        {
          title: 'Protocol',
          dataIndex: 'protocol',
        }
      ]"
    >
      <template #port="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.port`"
          :rules="[
            validators.consistofNumber(false),
            validators.numberBetween(1, 65535, false),
            validators.enhanceNoRedundance(exsitKeys, `${record.protocol}-${record.port}`, false),
          ]"
        >
          <el-input
            v-model="record.port"
          />
        </el-form-item>
      </template>
      <template #protocol="{record}">
        <el-select
          v-model="record.protocol"
          filterable
          placeholder="Please choose"
        >
          <el-option
            v-for="item in protocols"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
          />
        </el-select>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block/index.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    props: {
        selectKeys: Array,
        prefixKey: {
            type: String,
            default: '',
        },
        disabled: Boolean,
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            protocols: [
                { text: 'TCP', value: 'TCP' },
                { text: 'UDP', value: 'UDP' },
            ],
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => `${t.protocol}-${t.port}`);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                port: '',
                protocol: 'TCP',
            };
        },
    },
};
</script>

<style>

</style>
