<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :columns="[
        {
          title: 'ConfigMap name',
          dataIndex: 'resource'
        },
        {
          title: 'items',
          dataIndex: 'key'
        },
        {
          title: 'Mount directory',
          dataIndex: 'mountPath'
        },
        {
          title: 'Sub path',
          dataIndex: 'subPath'
        },
        {
          title: 'File path',
          dataIndex: 'filePath'
        },
      ]"
    >
      <template slot="th-key">
        Items
        <el-tooltip
          effect="dark"
          content="Mount the contents of a key value in the ConfigMap to a file path in the data volume through Items."
          placement="right"
          popper-class="ncs-el-tooltip-popper"
        >
          <i class="el-icon-question" />
        </el-tooltip>
      </template>
      <template slot="th-mountPath">
        Mount directory
        <el-tooltip
          effect="dark"
          content="That is, MountPath, mounts data to the specified path. If subpath is not specified, all files/directories under the directory will be overwritten."
          placement="right"
          popper-class="ncs-el-tooltip-popper"
        >
          <i class="el-icon-question" />
        </el-tooltip>
      </template>
      <template slot="th-subPath">
        Subpath
        <el-tooltip
          effect="dark"
          content="That is, subpath will be placed in the mount path as a file/directory and will not overwrite other files/directories in the mount path."
          placement="right"
          popper-class="ncs-el-tooltip-popper"
        >
          <i class="el-icon-question" />
        </el-tooltip>
      </template>
      <template slot="th-filePath">
        File path
        <el-tooltip
          effect="dark"
          content="That is, Path, used to rename mounted files."
          placement="right"
          popper-class="ncs-el-tooltip-popper"
        >
          <i class="el-icon-question" />
        </el-tooltip>
      </template>
      <template #imageFilter="{record}">
        <div style="text-align:center">
          <el-checkbox v-model="record.imageFilter" />
        </div>
      </template>
      <template #resource="{record}">
        <el-select
          v-model="record.resource"
          placeholder="Please choose"
          filterable
          size="huge"
          @change="record.key = ''"
        >
          <el-option
            v-for="item in resources"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </template>
      <template #key="{record}">
        <el-select
          v-model="record.key"
          placeholder="Please choose"
          filterable
        >
          <el-option
            v-for="item in getConfigMapKeyList(record.resource)"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </template>
      <template #mountPath="{record, index}">
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
      <template #subPath="{record, index}">
        <el-form-item
          label=""
          :prop="`${prefixKey}.${index}.subPath`"
          :rules="[
            validators.consistofSubPath(false)
          ]"
        >
          <!-- <el-input
            v-model="record.subPath"
            :disabled="!record.resource"
          /> -->
          <el-select
            v-model="record.subPath"
            placeholder="Please choose"
            filterable
            :disabled="!record.resource"
            allow-create
          >
            <el-option
              v-for="item in getConfigMapKeyList(record.resource)"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </template>
      <template #filePath="{record, index}">
        <el-form-item
          v-if="record.key"
          label=""
          :prop="`${prefixKey}.${index}.filePath`"
          :rules="[
            validators.consistofSubPath(false)
          ]"
        >
          <el-input
            v-model="record.filePath"
            :disabled="!record.resource"
          />
        </el-form-item>
        <div v-else />
      </template>
    </dynamicBlock>
    <div>
      If you need a new ConfigMap, you can
      <el-link
        type="primary"
        @click="openNewWindow({ path: '/control/configmaps/list', query: $route.query })"
      >
        Create ConfigMap
      </el-link>
      <i
        style="font-size:16px; margin-left: 8px"
        :class="loading ? 'el-icon-loading' : 'el-icon-refresh-right'"
        @click="update"
      />
    </div>
  </div>
  <!-- </template>
  </x-request> -->
</template>

<script>
import { flatten } from 'lodash';
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    props: {
        image: String,
    },
    data: () => ({
        validators,
        resource: 'configmaps',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-configmaps-`;
        },
        allOtherMountPath() {
            const otherVolumns = [];
            for (const key in this.volume) {
                if (key !== 'configmap') {
                    otherVolumns.push(this.volume[key]);
                }
            }
            const paths = flatten(otherVolumns.map(v => flatten(v.map(t => t.mountPath)))).filter(p => p);
            return paths;
        },
    },
    methods: {
        getConfigMapKeyList(resource) {
            const configmap = this.resources && this.resources.find(r => r.value === resource);
            if (configmap) {
                return [
                    { text: 'Don\'t choose yet', value: '' },
                    ...Object.keys(configmap.data || {}).map(d => ({ text: d, value: d })),
                ];
            }
            return [];
        },
        getDataTemplate() {
            return {
                imageFilter: false,
                resource: '',
                mountPath: '',
                subPath: '',
                key: '',
                filePath: '',
            };
        },
    },
};
</script>

<style>

</style>
