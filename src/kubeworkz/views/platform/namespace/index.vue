<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button
        icon="el-icon-plus"
        type="primary"
        @click="openCreateModal"
      >
        Create namespace
      </el-button>
      <el-button
        icon="el-icon-refresh-right"
        square
        @click="refresh"
      />
      <kube-pipe
        key="project"
        style="float: right;"
        graph="tenant"
        @pipestatechange="pipeLoading = $event"
      >
        <span style="line-height:32px;margin-right:12px">Tenant</span>
        <kubeTenantSelectMultiple
          v-model="tenant"
          style="width:300px"
          @syncTenant="syncTenant"
        />
        <!-- <kube-tenant-select v-model="tenant" /> -->
      </kube-pipe>
    </div>
    <x-request
      v-if="!pipeLoading"
      ref="nsrequest"
      :service="subNamespaceService"
      :params="{
        params : {
          tenant: tenant && tenant.map(item => item.value).join('|'),
        }
      }"
      :processor="subNamespaceResolver"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="namespace"
            label="Namespace"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="cluster"
            label="Cluster"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link
                type="primary"
                :title="row.cluster"
                @click="openClusterInfo(row)"
              >
                {{ row.clusterName }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="tenant"
            label="Tenant"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="project"
            label="Project"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="resourceQuota"
            label="Share resource"
            :show-overflow-tooltip="true"
            width="75"
          >
            <template>
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
              <template v-if="row.resourceQuota">
                <div>{{ row.resourceQuota.used['requests.cpu'] | clusterCpu }} / {{ row.resourceQuota.hard['requests.cpu'] | clusterCpu }} Cores</div>
                <div>{{ row.resourceQuota.used['requests.memory'] | clusterMemory }} / {{ row.resourceQuota.hard['requests.memory'] | clusterMemory }} Gi</div>
                <div>{{ row.resourceQuota.used['requests.nvidia.com/gpu'] }} / {{ row.resourceQuota.hard['requests.nvidia.com/gpu'] }} Cores</div>
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
              <template v-if="row.resourceQuota">
                <div>{{ row.resourceQuota.used['limits.cpu'] | clusterCpu }} / {{ row.resourceQuota.hard['limits.cpu'] | clusterCpu }} Cores</div>
                <div>{{ row.resourceQuota.used['limits.memory'] | clusterMemory }} / {{ row.resourceQuota.hard['limits.memory'] | clusterMemory }} Gi</div>
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
            width="180"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
                <el-link
                  :disabled="!row.resourceQuota && !row.nodeResourceQuato && !row.colocationResourceQuato"
                  type="primary"
                  @click="editItem(row)"
                >
                  Modify quota
                </el-link>
                <el-link
                  type="primary"
                  @click="editMetadata(row)"
                >
                  Modify meta information
                </el-link>
                <el-tooltip
                  v-if="row.isFederateMember"
                  class="item"
                  effect="dark"
                  content="This space is in federated mode. When you delete the federated space of the management cluster, the space will be deleted together."
                  placement="left"
                >
                  <el-link
                    type="primary"
                    disabled
                  >
                    Delete
                  </el-link>
                </el-tooltip>
                <el-link
                  v-else
                  type="primary"
                  @click="deleteItem(row)"
                >
                  Delete
                </el-link>
              </qz-link-group>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
    <ns-quota-dialog
      ref="nsquotadialog"
      @refresh="onRefresh"
    />
    <clusterInfoDialog
      ref="clusterInfoDialog"
    />
    <nsMetadataDialog
      ref="nsMetadataDialog"
    />
    <el-dialog
      title="Delete namespace"
      :visible.sync="showDelCheck"
      @close="showDelCheck = false"
    >
      <div style="margin-bottom:12px">
        Delete namespace "{{ delNsInfo && delNsInfo.namespace }}" All resources under this namespace will be deleted!
        <div v-if="delNsInfo && delNsInfo.isFederateMaster">
          This namespace is in federated mode, and the federated namespace under the associated business cluster will be deleted together!
        </div>
      </div>
      <div style="margin-bottom:20px">
        <el-input
          v-model="userInput"
          placeholder="Please enter the namespace name for secondary confirmation"
        />
      </div>
      <div slot="footer">
        <el-button @click="showDelCheck = false">
          Cancel
        </el-button>
        <el-button
          type="primary"
          :loading="delLoading"
          :disabled="userInput !== delNsInfo.namespace"
          @click="handleDelete"
        >
          Confirm deletion
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import clusterService from 'kubeworkz/services/cluster';
import workloadService from 'kubeworkz/services/k8s-resource';
import nsQuotaDialog from './ns-quota-dialog.vue';
import { unitConvertMemory, unitConvertCPU } from 'kubeworkz/utils/functional';
import clusterInfoDialog from './clusterInfoDialog.vue';
import kubeTenantSelectMultiple from 'kubeworkz/component/global/common/kube-tenant-select-multiple.vue';
import nsMetadataDialog from './ns-metadata-dialog.vue';
export default {
    metaInfo: {
        title: 'Namespace management - kubeworkz',
    },
    components: {
        nsQuotaDialog,
        clusterInfoDialog,
        kubeTenantSelectMultiple,
        nsMetadataDialog,
    },
    filters: {
        clusterCpu(cpu) {
            return unitConvertCPU(`${cpu}`); // m -> plain
        },
        clusterMemory(memory) {
            return Number(`${unitConvertMemory(memory, 'Gi')}`).toFixed(3); // Mi --> Gi
        },
    },
    data() {
        return {
            tenant: null,
            pipeLoading: true,
            quotaService: clusterService.getClusters,
            columns: [
                { name: 'namespace', title: 'Namespace' },
                { name: 'cluster', title: 'Cluster' },
                { name: 'tenant', title: 'Tenant' },
                { name: 'project', title: 'Project' },
                { name: 'resourceQuota', title: 'Share resource', width: '75px' },
                { name: 'request', title: 'Assigned quota/requested quota', width: '140px' },
                { name: 'limit', title: 'Cap/cap quota assigned', width: '140px' },
                { name: 'nodeQuato', title: 'Exclusive nodes (quota)' },
                { name: 'operation', title: 'Operation', width: '160px' },
            ],
            showDelCheck: false,
            delNsInfo: {},
            userInput: '',
            delLoading: false,
            clusterList: [],
            tenantList: [],
        };
    },
    computed: {

    },
    methods: {
        transformTenantName(tenant) {
            const target = this.tenantList.find(item => {
                return item.metadata.name === tenant;
            });
            return target && target.spec.displayName || tenant;
        },
        syncTenant(tenantList) {
            this.tenantList = tenantList;
        },
        openClusterInfo(item) {
            this.$refs.clusterInfoDialog.open(item);
        },
        async subNamespaceService(params) {
            const response = await clusterService.getSubnamespace(params);
            const quatoServerArr = [];
            response.items.forEach(namespace => {
                namespace.type = 'shared';
                quatoServerArr.push(new Promise(resolve => {
                    workloadService.getAPIV1Instance({
                        pathParams: {
                            cluster: namespace.cluster,
                            namespace: namespace.namespace,
                            resource: 'resourcequotas',
                            name: `${namespace.cluster}.${namespace.tenant}.${namespace.project}.${namespace.namespace}`,
                        },
                        noAlert: true,
                    }).then(res => {
                        resolve(res);
                    }).catch(err => {
                        resolve(null);
                    });
                }));
            });
            let resList = [];
            try {
                resList = await Promise.all(quatoServerArr);
            } catch (error) {
                console.log(error);
            }
            resList.forEach((res, index) => {
                const ns = response.items[index];
                if (ns.type === 'shared') {
                    ns.resourceQuota = res && res.status;
                }
            });
            return response;
        },
        normalizeCore(d) {
            return d / 1000;
        },
        formatQuota(used, capacity, normalize = d => d) {
            return `${normalize(used)}/${normalize(capacity)}`;
        },
        subNamespaceResolver(response) {
            return response.items;
        },
        quotaResolver(data) {
            return response => {
                return data.list.map(d => {
                    const { cluster } = d;
                    const clusters = response.items || [];
                    const c = clusters.find(c => c.clusterName === cluster);
                    return {
                        ...d,
                        ...c,
                    };
                });
            };
        },
        editMetadata(item) {
            this.$refs.nsMetadataDialog.open(item);
        },
        editItem(item) {
            this.$refs.nsquotadialog.open(item);
        },
        deleteItem(item) {
            this.delLoading = false;
            this.delNsInfo = {
                type: item.type,
                namespace: item.namespace,
                cluster: item.cluster,
                project: item.project,
                isFederateMaster: item.isFederateMaster,
            };
            this.userInput = '';
            this.showDelCheck = true;
            // this.$confirm({
            //     title: 'Delete',
            //     content: `Confirm to delete ${item.namespace}?`,
            //     ok: async () => {
            //         await kubeUltimateService.deleteNameSpace({
            //             params: {
            //                 type: item.type,
            //                 namespace: item.namespace,
            //                 cluster: item.cluster,
            //                 project: item.project,
            //             },
            //         });
            //         this.refresh();
            //     },
            // });
        },
        async handleDelete() {
            this.delLoading = true;
            try {
                await workloadService.deleteAPIV1Instance({
                    pathParams: {
                        cluster: this.delNsInfo.cluster,
                        namespace: this.delNsInfo.namespace,
                        resource: 'resourcequotas',
                        name: `${this.delNsInfo.cluster}.${this.tenant.value}.${this.delNsInfo.project}.${this.delNsInfo.namespace}`,
                    },
                });
            } catch (error) {
                if (error.reason !== 'NotFound') {
                    throw error;
                }
            }
            await workloadService.deleteNamespaceCRResource({
                pathParams: {
                    cluster: this.delNsInfo.cluster,
                    group: 'hnc.x-k8s.io',
                    version: 'v1alpha2',
                    plural: 'subnamespaceanchors',
                    namespace: `kubeworkz-project-${this.delNsInfo.project}`,
                    name: this.delNsInfo.namespace,
                },
            });
            // await kubeUltimateService.deleteNameSpace({
            //     params: omit(this.delNsInfo, [ 'isFederateMaster' ]),
            // });
            this.delLoading = false;
            this.showDelCheck = false;
            this.refresh();
        },
        refresh() {
            this.$refs.nsrequest.request();
        },
        openCreateModal() {
            this.$refs.nsquotadialog.open();
        },
        onRefresh() {
            this.refresh();
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
