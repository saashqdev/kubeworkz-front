<template>
  <div>
    <dynamicCard
      v-model="model"
      :initialAdd="true"
      :minCount="1"
      :getDefaultItem="getDataTemplate"
      addButtonText="Add image warehouse configuration"
      :validateFile="prefixProp"
    >
      <template slot-scope="{ item: dataModel, index: dataIndex }">
        <el-form-item 
          label="Mirror warehouse"
          :prop="`${prefixProp}.${dataIndex}.host`"
          :rules="[
            validators.required(),
            validators.noRedundance(exsitKeys, false),
          ]"
          style="margin-bottom: 24px;"
        >
          <el-input
            v-model="dataModel.host"
          />
        </el-form-item>
        <el-form-item 
          label="Username"
          :prop="`${prefixProp}.${dataIndex}.username`"
          :rules="[
            validators.required(),
          ]"
          style="margin-bottom: 24px;"
        >
          <el-input
            v-model="dataModel.username"
          />
        </el-form-item>
        <el-form-item 
          label="Password"
          :prop="`${prefixProp}.${dataIndex}.password`"
          :rules="[
            validators.required(),
          ]"
          style="margin-bottom: 24px;"
        >
          <el-input
            v-model="dataModel.password"
          />
        </el-form-item>
        <el-form-item 
          label="Email"
          :prop="`${prefixProp}.${dataIndex}.email`"
          :rules="[
            validators.email(false)
          ]"
          style="margin-bottom: 24px;"
        >
          <el-input
            v-model="dataModel.email"
          />
        </el-form-item>
      </template>
    </dynamicCard>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import blockLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/row.vue';
import dynamicCard from 'kubeworkz/elComponent/dynamic-card/index.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
      dynamicCard
    },
    props: {
      prefixProp: {
        type: String,
        default: ''
      }
    },
    mixins: [ makeVModelMixin ],
    data() {
        return {
            blockLayout,
            blockRowLayout,
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.host);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                host: '',
                username: '',
                password: '',
                email: '',
            };
        },
    },
};
</script>

<style>

</style>
