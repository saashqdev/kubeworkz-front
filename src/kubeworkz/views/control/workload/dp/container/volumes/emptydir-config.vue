<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
          {
              title: 'Name',
              dataIndex: 'resource',
          },
          {
              title: 'Permissions',
              dataIndex: 'readOnly'
          },
          {
              title: 'Mount directory',
              dataIndex: 'mountPath'
          }
      ]"
    >
      <template v-slot:resource="{record}">
        <el-select v-model="record.resource" placeholder="Please choose" filterable>
            <el-option
              v-for="item in volumeResources"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
      </template>
      <template v-slot:readOnly="{record}">
        <el-select v-model="record.readOnly" placeholder="Please choose" filterable>
          <el-option
            v-for="item in readOnlyList"
            :key="item.value"
            :label="item.text"
            :value="item.value">
          </el-option>
        </el-select>
      </template>
      <template v-slot:mountPath="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixKey}.${index}.mountPath`"
          :rules="[
            validators.startsWithSlash(false),
            validators.consistofPath(false),
            validators.noRedundance(allMountPath, false)
          ]"
        >
          <el-input
            v-model="record.mountPath"
            :disabled="!record.resource"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
    <div>
      If you need a new EmptyDir, you can
      <el-link
        type="primary"
        @click="openDialog"
      >
        Create EmptyDir
      </el-link>
    </div>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    props: {
        podVolumes: Object,
        openDialog: Function,
    },
    data: () => ({
        validators,
        resource: 'emptydir',
        readOnlyList: [
            { text: 'ReadAndWrite', value: false },
            { text: 'Readonly', value: true },
        ],
    }),
    computed: {
        volumeResources() {
            return this.podVolumes.emptyDir.map(dir => ({
                text: dir.name,
                value: dir.name,
            }));
        },
        errorprefix() {
            return `${this.prefixKey}-volume-emptydir-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                resource: '',
                readOnly: false,
                mountPath: '',
            };
        },
    },
};
</script>

<style>

</style>
