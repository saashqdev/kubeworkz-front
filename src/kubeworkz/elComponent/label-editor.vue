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
          dataIndex: 'value',
        }
      ]"
      :disabled="disabled"
    >
      <template slot="th-key">
        Key
        <el-tooltip
          effect="dark"
          placement="right"
        >
          <template slot="content">
            <div>Key is divided into prefix and suffix, separated by /, you can write only the suffix.</div>
            <div>Prefix: 0-253 lowercase letters, numbers, "-", ".", starting and ending with letters or numbers, "." must be preceded by letters or numbers.</div>
            <div>Suffix: 1-63 letters, numbers, "-", "_" or ".", starting and ending with letters or numbers.</div>
          </template>
          <i class="el-icon-question" />
        </el-tooltip>
      </template>
      <template #key="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.key`"
          :rules="[
            validators.lengthBetween(1, 63, false),
            validators.keyPattern(false),
            validators.noRedundance(exsitKeys, false),
            ...(!noSystemKeyRule && !record.disabled ? [ validators.noSystemKey(false) ] : []),
            ...(required ? [{ required: true, message: 'Cannot be empty'}] : [])
          ]"
        >
          <el-select
            v-if="selectKeys"
            v-model="record.key"
            :disabled="disabled || record.disabled || record.disabledKey"
            placeholder="Please choose"
            filterable
            allow-create
          >
            <el-option
              v-for="item in selectKeys"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-else
            v-model="record.key"
            :disabled="disabled || record.disabled || record.disabledKey"
          />
        </el-form-item>
      </template>
      <template #value="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${index}.value`"
          :rules="[
            ...(!!record.valueRequired ? [ validators.required() ] : []),
            ...(prefixKey === 'labels' ? [ validators.labelValuePatten(false) ] : []),
          ]"
        >
          <el-select
            v-if="record.selectValues"
            v-model="record.value"
            :disabled="disabled || record.disabled || record.disabledValue"
            placeholder="Please choose"
            filterable
            :allow-create="record.allowCreate"
          >
            <el-option
              v-for="item in record.selectValues"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-else
            v-model="record.value"
            :disabled="disabled || record.disabled || record.disabledValue"
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
        required: {
            type: Boolean,
            default: false,
        },
        selectKeys: Array,
        prefixKey: {
            type: String,
            default: '',
        },
        noSystemKeyRule: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
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
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
                disabled: false,
            };
        },
    },
};
</script>

<style>

</style>
