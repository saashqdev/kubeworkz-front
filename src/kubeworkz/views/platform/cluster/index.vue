<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="openCreateModal"
      >
        Add cluster
      </el-button>
      <el-button
        square
        icon="el-icon-refresh-right"
        @click="refresh"
      />
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <el-table
          v-loading="loading"
          :data="data ? data.list : []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="clusterDisplayName"
            label="Cluster name"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link
                :to="{ path: `/platform/cluster/${row.clusterName}` }"
                type="primary"
                :title="row.annotations && row.annotations['cluster.kubeworkz.io/cn-name']"
              >
                {{ row.annotations && row.annotations['cluster.kubeworkz.io/cn-name'] }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="clusterName"
            label="Cluster ID"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="clusterDescription"
            label="Description"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.clusterDescription || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="isMemberCluster"
            label="Cluster usage"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.isMemberCluster ? 'Business cluster' : 'Management and control cluster' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="cpu"
            label="CPU (used / total)"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              {{ row.usedCpu | clusterCpu }} / {{ row.totalCpu | clusterCpu }} Cores
            </template>
          </el-table-column>
          <el-table-column
            prop="memory"
            label="Memory (used / total)"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              {{ row.usedMem | clusterMemory }} / {{ row.totalMem | clusterMemory }} Gi
            </template>
          </el-table-column>
          <el-table-column
            prop="nodeCount"
            label="Node"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="namespaceCount"
            label="Namespace"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="status"
            label="Status"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.status | statusFilter }}
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="Operation"
            :show-overflow-tooltip="true"
            width="160"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="2">
                <el-link
                  type="primary"
                  @click="setItem(row)"
                >
                  Modify cluster
                </el-link>
                <el-link
                  type="primary"
                  :disabled="row.clusterName === controlClusterList[0].clusterName || row.status === 'deleting' || row.status === 'processing'"
                  @click="removeItem(row)"
                >
                  Delete configuration
                </el-link>
                <el-link
                  type="primary"
                  @click="editDomainSuffix(row)"
                >
                  Custom domain name suffix
                </el-link>
              </qz-link-group>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="data && calculatePages(data.total) > 0"
          style="float:right;margin-top:12px"
          :current-page="pagination.pageNum"
          :page-sizes="[100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="data.total"
          background
          @size-change="pageSizeChange"
          @current-change="pageNumChange"
        />
      </template>
    </x-request>
    <cluster-dialog
      ref="clusterDialog"
      @refresh="refresh"
    />
    <domainSuffixDialog
      ref="domainSuffixDialog"
      @refresh="refresh"
    />
    <el-dialog
      title="Delete cluster"
      :visible.sync="showDelete"
      width="700px"
      :close-on-click-modal="false"
    >
      <div
        :class="$style.noticeWrap"
      >
        <span :class="$style.textspan">
          Please refer to
        </span>
        <el-link
          type="primary"
          target="_blank"
          href="https://www.kubeworkz.io/docs/installation-guide/install-on-k8s/install-member-by-helm/#Uninstall-warden in a computing cluster"
        >
          Documentation link
        </el-link>
        <span :class="$style.textspan">
          to remove a managed computing cluster.
        </span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { get as getFun } from 'lodash';
import clusterService from 'kubeworkz/services/cluster';
import clusterDialog from './dialogs/cluster.vue';
import workloadService from 'kubeworkz/services/k8s-resource';
import domainSuffixDialog from './dialogs/domainSuffix.vue';
import { unitConvertMemory, unitConvertCPU } from 'kubeworkz/utils/functional';
import { get } from 'vuex-pathify';
import { paginationMixin } from 'kubeworkz/mixins';
// import {
//     toPlainObject
// } from 'kubeworkz/k8s-resources/scope/cluster';
export default {
    metaInfo: {
        title: 'Cluster management - kubeworkz',
    },
    filters: {
        clusterCpu(cpu) {
            return unitConvertCPU(`${cpu}m`); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(`${memory}Mi`, 'Gi')}`).toFixed(3); // Mi --> Gi
        },
        statusFilter(val) {
            switch (val) {
                case 'normal':
                    return 'Normal';
                case 'abnormal':
                    return 'Abnormal';
                case 'processing':
                    return 'Running';
                case 'deleting':
                    return 'Deleting';
                default:
                    return '-';
            }
        },
    },
    components: {
        clusterDialog,
        domainSuffixDialog,
    },
    mixins: [ paginationMixin ],
    data() {
        return {
            service: clusterService.getClusters,
            columns: [
                { name: 'clusterName', title: 'Name' },
                { name: 'clusterDescription', title: 'Description' },
                { name: 'cpu', title: 'CPU (used / total)' },
                { name: 'memory', title: 'Memory (used / total)' },
                { name: 'nodeCount', title: 'Node' },
                { name: 'namespaceCount', title: 'Namespace' },
                { name: 'status', title: 'Status' },
                // { name: 'metadata.creationTimestamp', title: 'Creation time' },
                { name: 'operation', title: 'Operation', width: '160px' },
            ],
            showDelete: false,
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
        requestParam() {
            return {
                params: {
                    ...this.pagination, // has to be this
                },
            };
        },
    },
    methods: {
        resolver(result) {
            // console.log(result);
            const r = {
                list: getFun(result, 'items', []),
                total: getFun(result, 'total', 0),
            };
            console.log(r);
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        removeItem() {
            this.showDelete = true;
        },
        editDomainSuffix(item) {
            this.$refs.domainSuffixDialog.open(item);
        },
        // editInfo(item) {

        // },
        openCreateModal() {
            this.$refs.clusterDialog.open();
        },
        setItem(item) {
            this.$refs.clusterDialog.open(item);
        },
    },
};
</script>

<style module>
.noticeWrap {
  display: flex;
  align-items: center;
}
.noticeWrap .textspan {
  flex-shrink: 0;
}
</style>
