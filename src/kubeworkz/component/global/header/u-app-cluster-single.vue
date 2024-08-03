<template>
  <u-linear-layout>
    <u-text v-if="!noTitle">
      Cluster
    </u-text>
    <u-select
      v-if="items.length"
      key="list"
      ref="cluster"
      :data="items"
      :value.sync="model"
      size="large"
      placeholder="Select cluster"
      @select="change"
      @before-select="onBeforeSelect"
    />
    <u-select
      v-else
      key="none"
      disabled
      size="large"
      placeholder="No cluster yet"
    />
  </u-linear-layout>
</template>

<script>
import clusterSelect from './u-app-cluster-select.vue';
export default {
    extends: clusterSelect,
    props: {
        noTitle: Boolean,
    },
    data() {
        return {
            name: 'clustersingle',
        };
    },
};
</script>

<style>

</style>
