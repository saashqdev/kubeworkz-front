<template>
  <div>
    <el-form-item
      label="Container port"
    >
      <el-switch
        v-model="model.enable"
      />
      <template v-if="model.enable">
        <dynamicBlock
          v-model="model.configs"
          :getDefaultItem="getDataTemplate"
          :columns="[
              {
                  title: 'Port',
                  dataIndex: 'containerPort',
              },
              {
                  title: 'Name',
                  dataIndex: 'name',
              },
              {
                  title: 'Protocol',
                  dataIndex: 'protocol',
              },
          ]"
        >
          <template v-slot:containerPort="{record}">
            <el-input-number v-model="record.containerPort" :min="1" :max="65535" controls-position="right"/>
          </template>
          <template v-slot:name="{record, index}">
            <el-form-item
              label=""
              :prop="`${prefixKey}.configs.${index}.name`"
              :rules="[
                validators.startsWithLowercaseLetter(false),
                validators.consistoLetterNumbersUnderscores(false),
                validators.noRedundance(allNames, false),
                validators.lengthBetween(1, 15, false),
              ]"
            >
              <el-input
                v-model="record.name"
                placeholder="Composed of 1-15 lowercase letters, numbers or underscores, starting with a letter and ending with a letter or number"
              />
            </el-form-item>
          </template>
          <template v-slot:protocol="{record}">
            <el-select v-model="record.protocol" placeholder="Please choose" filterable>
              <el-option
                v-for="item in protocols"
                :key="item.value"
                :label="item.text"
                :value="item.value">
              </el-option>
            </el-select>
          </template>
        </dynamicBlock>
      </template>
    </el-form-item>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
            protocols: [
                { text: 'TCP', value: 'TCP' },
                { text: 'UDP', value: 'UDP' },
            ],
        };
    },
    computed: {
        allNames() {
            return this.model.configs.map(t => t.name);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                containerPort: 8080,
                name: '',
                protocol: 'TCP',
            };
        },
    },
};
</script>

<style>

</style>
