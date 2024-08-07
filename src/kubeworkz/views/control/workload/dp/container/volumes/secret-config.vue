<template>
  <div>
    <dynamicBlock
      v-model="model"
      :getDefaultItem="getDataTemplate"
      :columns="[
          {
              title: 'Secret name',
              dataIndex: 'resource',
          },
          {
              title: 'Mount directory',
              dataIndex: 'mountPath'
          },
          {
              title: 'Subpath',
              dataIndex: 'subPath'
          }
      ]"
    >
      <template v-slot:resource="{record}">
        <el-select v-model="record.resource" placeholder="Please choose" filterable>
            <el-option
              v-for="item in resources"
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
      <template v-slot:subPath="{record, index}">
        <el-form-item 
          label=""
          :prop="`${prefixKey}.${index}.subPath`"
          :rules="[
            validators.consistofSubPath(false)
          ]"
        >
          <el-input
            v-model="record.subPath"
            :disabled="!record.resource"
          />
        </el-form-item>
      </template>
    </dynamicBlock>
     <div>
      If you need a new Secret, you can
      <el-link
        type="primary"
        @click="openNewWindow({ path: '/control/secrets/list', query: $route.query })"
      >
        Create Secret
      </el-link>
      <i
        style="font-size:16px; margin-left: 8px"
        :class="loading ? 'el-icon-loading' : 'el-icon-refresh-right'"
        @click="update"
      />
    </div>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import volumnMixin from './volumn-mixin';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    data: () => ({
        validators,
        resource: 'secrets',
    }),
    computed: {
        errorprefix() {
            return `${this.prefixKey}-volume-secrets-`;
        },
    },
    methods: {
        getDataTemplate() {
            return {
                resource: '',
                mountPath: '',
                subPath: '',
            };
        },
    },
};
</script>

<style>

</style>
