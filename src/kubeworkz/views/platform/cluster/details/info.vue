<template>
  <div>
    <el-button
      type="primary"
      style="margin-bottom: 20px"
      @click="viewYAML"
    >
      Check the detail information
    </el-button>
    <el-descriptions title="Basic Information" :column="1">
      <el-descriptions-item label="Cluster name">
        {{ instance.annotations && instance.annotations['cluster.kubeworkz.io/cn-name'] }}
      </el-descriptions-item>
      <el-descriptions-item label="Cluster ID">
        {{ instance.clusterName }}
      </el-descriptions-item>
      <el-descriptions-item label="Description">
        {{ instance.clusterDescription }}
      </el-descriptions-item>
      <el-descriptions-item label="Status">
        {{ instance.status | clusterStatus }}
      </el-descriptions-item>
      <el-descriptions-item label="Creation time">
        {{ instance.createTime | formatLocaleTime }}
      </el-descriptions-item>
      <el-descriptions-item label="Number of nodes">
        {{ instance.nodeCount }}
      </el-descriptions-item>
      <el-descriptions-item label="CPU">
        {{ instance.totalCpu | clusterCpu }} Cores
      </el-descriptions-item>
      <el-descriptions-item label="Memory">
        {{ instance.totalMem | clusterMemory }} GiB
      </el-descriptions-item>
      <el-descriptions-item label="Cluster usage">
        {{ instance.isMemberCluster ? 'Business cluster' : 'Management and control cluster' }}
      </el-descriptions-item>
      <el-descriptions-item label="Cluster network">
        {{ instance.networkType }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import {
    CLUSTER_STATUS_MAP,
} from 'kubeworkz';
import { unitConvertCPU, unitConvertMemory } from 'kubeworkz/utils/functional';

export default {
    filters: {
        clusterStatus(status) {
            return CLUSTER_STATUS_MAP[status] || '-';
        },
        clusterCpu(cpu) {
            return unitConvertCPU(`${cpu}m`); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(`${memory}Mi`, 'Gi')}`).toFixed(3); // Mi --> Gi
        },
    },
    props: {
        instance: Object,
    },
    methods: {
        viewYAML() {
            this.$editResource({
                title: `${this.instance.clusterName} —— Check the detail information`,
                content: this.instance,
                editorOption: {
                    readOnly: true,
                },
            });
        },
        areaText(val, list) {
            const target = list.find(item => item.value === val);
            return target && target.text || val;
        },
    },
};
</script>

<style>

</style>
