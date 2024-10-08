<template>
  <div>
    <template v-if="isInNodeRoute || isInNetworkRoute">
      <router-view />
    </template>
    <template v-else>
      <headCard :title="clusterDisplayName">
        <div slot="logo">
          {{ (clusterName || '').substring(0, 2).toUpperCase() }}
        </div>
        <div slot="act">
          ({{ clusterName }})
        </div>
      </headCard>
      <x-request
        :service="service"
        :params="{
          params: {
            cluster: clusterName
          }
        }"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading, error }">
          <i
            v-if="loading"
            class="el-icon-loading"
            style="font-size: 24px"
          />
          <div v-else-if="error">
            Loading error!
          </div>
          <template v-else>
            <el-tabs
              :value="routeName"
              page="main"
              @tab-click="(pane) => handleTabClick(pane, getTabs(data))"
            >
              <el-tab-pane
                v-for="(item, index) in getTabs(data)"
                :key="index"
                :label="item.title"
                :name="item.path"
                :disabled="item.disabled"
              />
            </el-tabs>
            <!-- <u-tabs router>
              <u-tab
                v-for="(item, index) in getTabs(data)"
                :key="index"
                :value="item"
                :title="item.title"
                :disabled="item.disabled"
                :to="{ path: item.path }"
              />
            </u-tabs> -->
            <router-view :instance="data" />
          </template>
        </template>
      </x-request>
    </template>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import clusterService from 'kubeworkz/services/cluster';
export default {
    data() {
        return {
            service: clusterService.getClusters,
            clusterDisplayName: '',
        };
    },
    computed: {
        clusterName() {
            return this.$route.params.name;
        },
        isInNodeRoute() {
            return this.$route.name.startsWith('platform.cluster.nodedetail');
        },
        isInNetworkRoute() {
            return [ 'platform.cluster.detail.network.create', 'platform.cluster.detail.network.edit' ].includes(this.$route.name);
        },
        routeName() {
            return this.$route.path;
        },
    },
    methods: {
        handleTabClick(pane, tabs) {
            const target = tabs.find(item => item.path === pane.name);
            this.$router.push({ path: target.path });
        },
        getTabs(instance) {
            const isAbnormal = (instance.status !== 'normal');
            return [
                { title: 'Details', path: `/platform/cluster/${this.clusterName}/info` },
                { title: 'Node', path: `/platform/cluster/${this.clusterName}/node`, disabled: isAbnormal },
                { title: 'Storage class', path: `/platform/cluster/${this.clusterName}/storageclass`, disabled: isAbnormal },
                { title: 'Persistent storage', path: `/platform/cluster/${this.clusterName}/persistentvolumes`, disabled: isAbnormal },
                { title: 'Network strategy', path: `/platform/cluster/${this.clusterName}/network`, disabled: isAbnormal },
                { title: 'Monitor', path: `/platform/cluster/${this.clusterName}/monitor`, disabled: isAbnormal },
            ];
        },
        resolver(response) {
            const instance = getFunc(response, 'items.[0]');
            this.clusterDisplayName = instance.annotations && instance.annotations['cluster.kubeworkz.io/cn-name'];
            return getFunc(response, 'items.[0]');
        },
    },
};
</script>

<style>

</style>
