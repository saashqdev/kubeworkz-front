<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button
        icon="el-icon-refresh-right"
        square
        @click="refresh"
      />
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="params"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="name"
            label="Component name"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link
                type="primary"
                :to="{ path: `/platform/monitor/${row.metadata.name}` }"
              >
                {{ row.metadata.name }}
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
  </div>
</template>

<script>
import monitorService from 'kubeworkz/services/monitor';
import { get } from 'vuex-pathify';
export default {
    metaInfo: {
        title: 'Component monitoring - kubeworkz',
    },
    data() {
        return {
            service: monitorService.getInnerDashboardByQuery,
            columns: [
                { name: 'metadata.name', title: 'Component name' },
            ],
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
        params() {
            return {
                pathParams: {
                    cluster: this.controlClusterList[0].clusterName,
                },
                params: {
                    labelSelector: 'scope=component-monitoring',
                },
            };
        },
    },
    methods: {
        resolver(response) {
            return (response.items || []);
        },
        refresh() {
            this.$refs.request.request();
        },
    },
};
</script>

<style>

</style>
