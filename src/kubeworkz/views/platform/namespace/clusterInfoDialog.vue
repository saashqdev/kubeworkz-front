<template>
  <el-dialog
    title="Cluster details"
    :visible.sync="show"
    :close-on-click-modal="false"
    width="640px"
    @close="show = false"
  >
    <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
    <el-form
      v-else
      label-position="right"
      label-width="120px"
    >
      <el-form-item label="Cluster name">
        {{ instance.annotations && instance.annotations['cluster.kubeworkz.io/cn-name'] }}
      </el-form-item>
      <el-form-item label="Cluster ID">
        {{ instance.clusterName }}
      </el-form-item>
      <el-form-item label="Description">
        {{ instance.clusterDescription }}
      </el-form-item>
      <el-form-item label="Status">
        {{ instance.status | clusterStatus }}
      </el-form-item>
      <el-form-item label="Creation time">
        {{ instance.createTime | formatLocaleTime }}
      </el-form-item>
      <el-form-item label="Number of nodes">
        {{ instance.nodeCount }}
      </el-form-item>
      <el-form-item label="CPU">
        {{ instance.totalCpu | clusterCpu }} Cores
      </el-form-item>
      <el-form-item label="Memory">
        {{ instance.totalMem | clusterMemory }} GiB
      </el-form-item>
      <el-form-item label="Cluster usage">
        {{ instance.isMemberCluster ? 'Business cluster' : 'Management and control cluster' }}
      </el-form-item>
      <el-form-item label="Cluster network">
        {{ instance.networkType }}
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import {
    CLUSTER_STATUS_MAP,
} from 'kubeworkz';
import { unitConvertCPU, unitConvertMemory } from 'kubeworkz/utils/functional';
import clusterService from 'kubeworkz/services/cluster';

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
    data() {
        return {
            regionsList: [],
            zoneList: [],
            instance: {},
            show: false,
            loading: false,
        };
    },
    methods: {
        async open(item) {
            this.show = true;
            this.loading = true;
            await this.loadClusterInfo(item.cluster);
            this.loading = false;
        },
        async loadClusterInfo(clusterName) {
            const res = await clusterService.getClusters({
                params: {
                    cluster: clusterName,
                },
            });
            this.instance = res.items[0] || {};
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