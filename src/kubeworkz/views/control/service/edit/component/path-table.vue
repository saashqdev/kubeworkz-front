<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :columns="[
        {
          title: 'Path',
          dataIndex: 'path',
        },
        {
          title: 'Service',
          dataIndex: 'service',
        },
        {
          title: 'Port',
          dataIndex: 'port',
        }
      ]"
    >
      <template #path="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.path`"
          :rules="[
            validators.required(),
            validators.startsWithSlash(false),
            validators.consistofPath(false),
            validators.noRedundance(exsitPaths, false)
          ]"
        >
          <el-input
            v-model="record.path"
            placeholder="Please enter the path or regular expression"
          />
        </el-form-item>
      </template>
      <template #service="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.service`"
          :rules="[
            validators.required(),
            validators.noRedundance(exsitKeys, false)
          ]"
        >
          <el-select
            v-model="record.service"
            filterable
            placeholder="Please choose"
          >
            <el-option
              v-for="item in serviceList"
              :key="item.value"
              :label="item.text"
              :value="item.value"
              :title="item.text"
            />
          </el-select>
        </el-form-item>
      </template>
      <template #port="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.port`"
          :rules="[
            validators.required(),
            validators.consistofNumber(false),
            validators.numberBetween(1, 65535, false),
          ]"
        >
          <el-input
            v-model="record.port"
            placeholder="1-65535 internal integer"
          />
        </el-form-item>
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
        index: Number,
        defaultService: {
            type: String,
            default: '',
        },
        serviceList: Array,
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
        exsitPaths() {
            return this.model.map(t => t.path);
        },
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                path: '',
                service: this.defaultService,
                port: '',
            };
        },
    },
};
</script>

<style>

</style>
