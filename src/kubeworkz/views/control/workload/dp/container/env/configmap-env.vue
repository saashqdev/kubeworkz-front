<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
        {
          title: 'Key',
          dataIndex: 'key',
        },
        {
          title: 'Configmap',
          dataIndex: 'configmap',
        },
        {
          title: 'ConfigmapKey',
          dataIndex: 'configmapKey'
        },
      ]"
    >
      <template v-slot:key="{record, index}">
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
      <template v-slot:configmap="{record}">
        <el-select v-model="record.configmap" placeholder="Please choose" filterable @change="item.configmapKey = ''">
          <el-option
            v-for="item in resources"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template v-slot:configmapKey="{record}">
        <el-select v-model="record.configmapKey" placeholder="Please choose" filterable>
          <el-option
            v-for="item in getKeys(record.configmap)"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
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
        resource: 'configmaps',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-env-configmap-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                configmap: '',
                configmapKey: '',
            };
        },
    },
};
</script>

<style>

</style>
