<template>
  <div>
    <kube-pipe
      key="quota-project"
      component="div"
      graph="tenant"
      @pipestatechange="pipeLoading = $event"
    >
      <span style="margin-right:8px;line-height:32px">Tenant</span>
      <kubeTenantSelectMultiple
        v-model="tenant"
        style="width:300px"
      />
    </kube-pipe>
    <x-request
      v-if="!pipeLoading"
      ref="requestcluster"
      style="margin-top: 12px;"
      :service="clusterService()"
      :params="{
        params: {
          status: 'normal',
          nodeLabelSelector: 'node.kubeworkz.io/tenant=share',
          prune: true,
        },
        tenant: tenant
      }"
    >
      <template slot-scope="{ data: quota, loading: quotaLoading }">
        <el-table
          v-loading="quotaLoading"
          :data="quota || []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="clusterDisplayName"
            label="Cluster name"
            :show-overflow-tooltip="true"
          />

          <el-table-column
            prop="clusterName"
            label="Cluster ID"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="tenantDisplayName"
            label="Tenant"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="kuberesourcequota"
            label="Shared resources"
            :show-overflow-tooltip="true"
            width="75"
          >
            <template slot-scope="{ row }">
              <div>CPU</div>
              <div>Memory</div>
              <div>GPU</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="request"
            label="Assigned request/request quota"
            :show-overflow-tooltip="true"
            width="140"
          >
            <template slot-scope="{ row }">
              <template v-if="row.kuberesourcequota">
                <div>{{ row.kuberesourcequota.status.used.cpu }} / {{ row.kuberesourcequota.status.hard.cpu }} Cores</div>
                <div>{{ row.kuberesourcequota.status.used.memory | clusterMemory }} / {{ row.kuberesourcequota.status.hard.memory | clusterMemory }} Gi</div>
                <div>{{ row.kuberesourcequota.status.used.gpu }} / {{ row.kuberesourcequota.status.hard.gpu }} Cores</div>
              </template>
              <div v-else>
                -
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="limit"
            label="Cap/cap quota assigned"
            :show-overflow-tooltip="true"
            width="140"
          >
            <template slot-scope="{ row }">
              <template v-if="row.kuberesourcequota">
                <div>{{ row.kuberesourcequota.status.used.limitsCpu }} / {{ row.kuberesourcequota.status.hard.limitsCpu }} Cores</div>
                <div>{{ row.kuberesourcequota.status.used.limitsMemory | clusterMemory }} / {{ row.kuberesourcequota.status.hard.limitsMemory | clusterMemory }} Gi</div>
                <div>-</div>
              </template>
              <div v-else>
                -
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="Operation"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              <el-link
                type="primary"
                :disabled="row.status !== 'normal'"
                @click="editItem(row)"
              >
                Adjust quota
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
    <quota-dialog
      ref="quotadialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import clusterService from 'kubeworkz/services/cluster';
import PageMixin from 'kubeworkz/mixins/pagination';
import quotaDialog from './quota-dialog.vue';
import { unitConvertMemory, unitConvertCPU } from 'kubeworkz/utils/functional';
import scopeService from 'kubeworkz/services/scope';
import { get } from 'vuex-pathify';
import {
    toPlainObject as toKubeResourceQoutaPlainObject,
} from 'kubeworkz/k8s-resources/kubeResourceQuota/index.js';
import kubeTenantSelectMultiple from 'kubeworkz/component/global/common/kube-tenant-select-multiple.vue';
import userService from 'kubeworkz/services/user';

export default {
    metaInfo: {
        title: 'Tenant quota - kubeworkz',
    },
    components: {
        quotaDialog,
        kubeTenantSelectMultiple,
    },
    filters: {
        clusterCpu(cpu) {
            return unitConvertCPU(`${cpu}m`); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(`${memory}Mi`, 'Gi')}`).toFixed(3); // Mi --> Gi
        },
    },
    mixins: [ PageMixin ],
    data() {
        return {
            tenant: null,
            pipeLoading: true,
            tenantClusterService: clusterService.getClusterByScope,
            columns: [
                { name: 'clusterDisplayName', title: 'Cluster name' },
                { name: 'clusterName', title: 'Cluster ID' },
                // { name: 'tenant', title: 'Tenant ID' },
                { name: 'tenantDisplayName', title: 'Tenant' },
                // { name: 'resource', title: 'Shared resources (request quota allocated/cap quota allocated/request quota/cap quota)', width: '370px' },
                { name: 'kuberesourcequota', title: 'Shared resources', width: '75px' },
                { name: 'request', title: 'Assigned quota/requested quota', width: '140px' },
                { name: 'limit', title: 'Cap/cap quota assigned', width: '140px' },
                // { name: 'memory', title: 'Persistent storage (allocated/quota)' },
                { name: 'operation', title: 'Operation', width: '160px' },
            ],
        };
    },
    computed: {
        // params() {
        //     return {
        //         params: {
        //             namespace: getFunc(this.tenant, 'spec.namespace'),
        //         },
        //     };
        // },
        controlClusterList: get('scope/controlClusterList'),
    },
    methods: {
        clusterService() {
            return async params => {
                const response = await clusterService.getClusters({ params: params.params });
                const tenantRes = await userService.getUserTenants({});
                const list = [];
                let tenantList = getFunc(tenantRes, 'items') || [];
                if (params.tenant && params.tenant.length) {
                    console.log(params.tenant);
                    tenantList = tenantList.filter(item => params.tenant.map(item => item.value).includes(item.metadata.name));
                }
                tenantList.forEach(tenentItem => {
                    (getFunc(response, 'items') || []).forEach(clusterItem => {
                        list.push({
                            clusterDisplayName: clusterItem.annotations && clusterItem.annotations['cluster.kubeworkz.io/cn-name'],
                            clusterName: clusterItem.clusterName,
                            tenant: tenentItem.metadata.name,
                            tenantDisplayName: tenentItem.spec.displayName,
                            status: clusterItem.status,
                        });
                    });
                });
                const arr = list.map(item => {
                    return scopeService.getKubeQuotaResourceInstance({
                        pathParams: {
                            cluster: this.controlClusterList[0].clusterName,
                            name: `${item.clusterName}.${item.tenant}`,
                        },
                    });
                });
                const res = await Promise.all(arr);
                list.forEach((i, index) => {
                    i.kuberesourcequota = res[index] && toKubeResourceQoutaPlainObject(res[index]);
                });
                return list;
            };
        },
        refresh() {
            this.$refs.requestcluster.request();
        },
        tenantClusterResolver(response) {
            return getFunc(response, 'items', []);
        },
        normalizeCore(d) {
            return d / 1000;
        },
        formatQuota(used, capacity, normalize = d => d) {
            return `${normalize(used)}/${normalize(capacity)}`;
        },
        editItem(item) {
            this.$refs.quotadialog.open(item);
        },
    },
};
</script>

<style module>
.table p {
    line-height: 1.5em;
    margin: 0;
}
</style>
