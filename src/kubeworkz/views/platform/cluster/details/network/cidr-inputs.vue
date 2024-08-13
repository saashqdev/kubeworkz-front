<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :columns="[
        {
          title: 'Exception CIDR',
          dataIndex: 'cidr',
        },
      ]"
      :disabled="disabled"
    >
      <template #cidr="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.cidr`"
          :rules="[
            validators.cidr(false),
            validators.noRedundance(exsitKeys, false),
          ]"
        >
          <el-input
            v-model="record.cidr"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block/index.vue';
import * as validators from 'kubeworkz/utils/validators';
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
export default {
    components: {
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    props: {
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
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.cidr);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                cidr: '',
            };
        },
    },
};
</script>

<style>

</style>
