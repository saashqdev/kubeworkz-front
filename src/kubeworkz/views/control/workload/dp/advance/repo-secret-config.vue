<template>
  <div>
    <el-form-item
      label="Repository key"
      layout="block"
    >
      <el-select
        v-model="model"
        multiple
        placeholder="Please choose"
      >
        <el-option
          v-for="item in repoSecrets"
          :key="item.value"
          :label="item.text"
          :value="item.value"
        />
      </el-select>
      <div>
        If you need a new Secret, you can
        <el-link
          type="primary"
          @click="openNewWindow({ path: '/control/secrets/list', query: $route.query })"
        >
          Create secret
        </el-link>
        <i
          style="font-size:16px; margin-left: 8px"
          :class="loading ? 'el-icon-loading' : 'el-icon-refresh-right'"
          @click="update"
        />
      </div>
    </el-form-item>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import volumnMixin from 'kubeworkz';
export default {
    mixins: [ makeVModelMixin, volumnMixin ],
    data() {
        return {
            resource: 'secrets',
        };
    },
    computed: {
        repoSecrets() {
            return this.resources.filter(i => i.type === 'kubernetes.io/dockerconfigjson');
        },
    },
};
</script>

<style>

</style>
