<template>
  <el-button
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot name="default" />
  </el-button>
</template>
<script>
export default {
    name: 'OperateButtonOption',
    data() {
        return {};
    },
};
</script>
