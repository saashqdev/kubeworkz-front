<template>
  <div>
    <div style="margin-bottom: 12px;">
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="$refs.nodedialog.open()"
      >
        Add node
      </el-button>
      <el-button
        square
        icon="el-icon-refresh-right"
        @click="refresh"
      />
      <nodeInputSearch
        :align-right="true"
        :node-status-map="nodeStatusMap"
        @search="onSearch"
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
          :class="$style.table"
          :data="data ? data.list : []"
          style="width: 100%"
          border
          @sort-change="tableSortChange"
        >
          <el-table-column
            prop="metadata.name"
            label="Name"
            :show-overflow-tooltip="true"
            sortable
          >
            <template slot-scope="{ row }">
              <div>
                <el-tooltip
                  v-if="row.metadata.labels.find(i => i.key === 'node-role.kubernetes.io/master')"
                  class="item"
                  effect="dark"
                  content="Master node"
                  placement="bottom"
                >
                  <span :class="$style.master_flag">Control</span>
                </el-tooltip>
                <el-link
                  type="primary"
                  :to="{ path: `/platform/cluster/${instance.clusterName}/${row.metadata.name}` }"
                >
                  {{ row.metadata.name }}
                </el-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="status.nodeIP"
            label="IP"
            :show-overflow-tooltip="true"
            width="120"
            sortable
          />
          <el-table-column
            prop="status.capacity.cpu"
            label="CPU"
            :show-overflow-tooltip="true"
            width="80"
          >
            <template slot-scope="{ row }">
              {{ row.status.capacity.cpu | cpuFilter }} Cores
            </template>
          </el-table-column>
          <el-table-column
            prop="status.capacity.memory"
            label="Memory"
            :show-overflow-tooltip="true"
            width="80"
          >
            <template slot-scope="{ row }">
              {{ row.status.capacity.memory | memoryFilter }} Gi
            </template>
          </el-table-column>
          <el-table-column
            prop="status.capacity['nvidia.com/gpu']"
            label="GPU"
            :show-overflow-tooltip="true"
            width="60"
          >
            <template slot-scope="{ row }">
              {{ row.status.capacity['nvidia.com/gpu'] || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="metadata.labels"
            label="Label"
            :show-overflow-tooltip="true"
            width="180"
          >
            <template slot-scope="{ row }">
              <tagList
                :data="row.metadata.labels"
                :item-formatter="(i) => `${i.key}:${i.value}`"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="spec.type"
            label="Node type"
            :show-overflow-tooltip="true"
            width="70"
          />
          <el-table-column
            prop="spec.unschedulable"
            label="Scheduling"
            :show-overflow-tooltip="true"
            width="60"
          >
            <template slot-scope="{ row }">
              {{ row.spec.unschedulable ? 'Unschedulable' : 'Scheduling' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status.statusText"
            label="Status"
            :show-overflow-tooltip="true"
            width="60"
          >
            <template slot-scope="{ row }">
              {{ row.status.statusText | nodeStatusFilter }}
            </template>
          </el-table-column>
          <el-table-column
            prop="operation"
            label="Operation"
            :show-overflow-tooltip="true"
            width="200"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
                <el-link
                  type="primary"
                  @click="openLabelsModal(row)"
                >
                  Edit tag
                </el-link>
                <el-link
                  type="primary"
                  @click="schedule(row)"
                >
                  {{ !row.spec.unschedulable ? 'Prohibit' : 'Allow' }} scheduling
                </el-link>
                <el-link
                  type="primary"
                  @click="setTaints(row)"
                >
                  Set taints
                </el-link>
                <el-link
                  type="primary"
                  @click="drainItem(row)"
                >
                  Drain item
                </el-link>
                <el-link
                  type="primary"
                  :disabled="isDeleteForbidden(row)"
                  @click="deleteItem(row)"
                >
                  Delete
                </el-link>
              </qz-link-group>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-if="data && calculatePages(data.total) > 0"
          style="float:right;margin-top:12px"
          :current-page="pagenation.pageNum"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          :page-size="pagenation.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="data.total"
          background
          @size-change="pageSizeChange"
          @current-change="pageNumChange"
        />
      </template>
    </x-request>
    <taint-dialog
      ref="taintdialog"
      :instance="instance"
      @refresh="refresh"
    />
    <nodeDialog
      ref="nodedialog"
      :instance="instance"
      @refresh="refresh"
    />
    <labelDialog
      ref="labelDialog"
      :instance="instance"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get } from 'lodash';
import workloadService from 'kubeworkz/services/k8s-resource';
import workloadExtendService from 'kubeworkz/services/k8s-extend-resource';
import PageMixin from 'kubeworkz/mixins/pagenation';
import {
    toPlainObject as toNodePlainObject,
} from 'kubeworkz/k8s-resources/node';
import {
    toPlainObject as toMetadataPlainObject,
} from 'kubeworkz/k8s-resources/metadata';
import taintDialog from '../dialogs/taint.vue';
import nodeDialog from '../dialogs/node.vue';
import labelDialog from '../dialogs/labels.vue';
const formatter = item => `${item.key}: ${item.value}`;
import { unitConvertMemory, unitConvertCPU } from 'kubeworkz/utils/functional';
import nodeInputSearch from './component/node-input-serch.vue';
const nodeStatusMap = {
    unscheduled: 'In maintenance',
    normal: 'Normal',
    abnormal: 'Abnormal',
};
export default {
    components: {
        taintDialog,
        nodeDialog,
        labelDialog,
        nodeInputSearch,
    },
    filters: {
        cpuFilter(cpu) {
            return unitConvertCPU(`${cpu}`); // m -> plain
        },
        memoryFilter(memory) {
            return Number(`${unitConvertMemory(`${memory}`, 'Gi')}`).toFixed(3); // Mi --> Gi
        },
        nodeStatusFilter(val) {
            return nodeStatusMap[val] || val || '-';
        },
    },
    mixins: [ PageMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            nodeStatusMap,
            service: workloadExtendService.getResourceListWithoutNamespace,
            selectRows: [],
            // columns: [
            //     { type: 'selection', width: '60px' },
            //     { title: 'Name', name: 'metadata.name', sortable: true },
            //     { title: 'IP', name: 'status.nodeIP', width: '120px', sortable: true },
            //     { title: 'CPU', name: 'status.capacity.cpu', width: '80px' },
            //     { title: 'Memory', name: 'status.capacity.memory', width: '80px' },
            //     { title: 'GPU', name: 'status.capacity["nvidia.com/gpu"]', width: '60px' },
            //     { title: 'Label', name: 'metadata.labels', type: 'tag', width: '180px', cellprops: { hasModal: true, isChip: true, formatter } },
            //     { title: 'Node type', name: 'spec.type', width: '70px' },
            //     { title: 'Scheduling', name: 'spec.unschedulable', width: '60px' },
            //     { title: 'Status', name: 'status.statusText', width: '60px' },
            //     { title: 'Operation', name: 'operation', width: '180px' },
            // ],
        };
    },
    computed: {
        isControlCluster() {
            return !this.instance.isMemberCluster;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'nodes',
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
        clusterName() {
            return this.$route.params.name;
        },
        columns() {
            return [
                { title: 'Name', name: 'metadata.name', sortable: true },
                { title: 'IP', name: 'status.nodeIP', width: '120px', sortable: true },
                { title: 'CPU', name: 'status.capacity.cpu', width: '80px' },
                { title: 'Memory', name: 'status.capacity.memory', width: '80px' },
                { title: 'GPU', name: 'status.capacity["nvidia.com/gpu"]', width: '60px' },
                { title: 'Label', name: 'metadata.labels', type: 'tag', width: '180px', cellprops: { hasModal: true, isChip: true, formatter } },
                { title: 'Node type', name: 'spec.type', width: '70px' },
                { title: 'Scheduling', name: 'spec.unschedulable', width: '60px' },
                { title: 'Status', name: 'status.statusText', width: '60px' },
                { title: 'Operation', name: 'operation', width: '180px' },
            ];
        },
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            return {
                list: response.items.map(toNodePlainObject),
                total: response.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        onSort({ order, name }) {
            this.pagenation.sortOrder = order;
            this.pagenation.sortName = `${name}`;
            this.pagenation.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch({ value, valueType }) {
            if (valueType === 'name') {
                this.pagenation.selector = value ? `metadata.name~${value}` : undefined;
            }
            if (valueType === 'label') {
                this.pagenation.selector = value ? `metadata.labels.${value}` : undefined;
            }
            if (valueType === 'status') {
                this.pagenation.selector = value ? `extendInfo.status=${value}` : undefined;
            }
        },
        onSelectionChange($event) {
            this.selectRows = $event;
        },
        openLabelsModal(item) {
            this.$refs.labelDialog.open(item);
        },
        schedule(item) {
            if (!item.spec.unschedulable) {
                this.$eConfirm({
                    message: 'Action Are you sure that workload scheduling to this node is prohibited?',
                    title: 'Hint',
                    ok: async () => {
                        await this.modifyNode(item, { spec: { unschedulable: true } });
                    },
                });
            } else {
                this.modifyNode(item, { spec: { unschedulable: false } });
            }
        },
        async modifyNode(item, patch) {
            await workloadService.modifyResourceWithoutNamespace({
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'nodes',
                    name: get(item, 'metadata.name'),
                },
                data: patch,
            });
            this.refresh();
        },
        setTaints(item) {
            this.$refs.taintdialog.open(item);
        },
        drainItem(item) {
            this.$eConfirm({
                message: `Drain node ${item.metadata.name}?`,
                subMessage: 'Draining will evict all Pods on the node. Please ensure that there are suitable nodes for scheduling.',
                title: 'Drain item',
                ok: async () => {
                    const pods = await workloadService.getResourceListWithoutNamespace({
                        pathParams: {
                            cluster: this.instance.clusterName,
                            resource: 'pods',
                        },
                        params: {
                            fieldSelector: `spec.nodeName=${item.metadata.name}`,
                            pageSize: 10000,
                        },
                    });
                    const pod = pods.items.map(toMetadataPlainObject).filter(i => ![ 'kube-public', 'kube-system' ].includes(i.namespace) && _.get(i, 'ownerReferences[0].kind') !== 'DaemonSet');
                    await Promise.all(pod.map(p => new Promise(async (r, j) => {
                        try {
                            await workloadService.eviction({
                                pathParams: {
                                    cluster: this.instance.clusterName,
                                    namespace: p.namespace,
                                    name: p.name,
                                },
                                data: {
                                    apiVersion: 'policy/v1beta1',
                                    kind: 'Eviction',
                                    metadata: {
                                        name: p.name,
                                        namespace: p.namespace,
                                    },
                                },
                            });
                            r();
                        } catch (err) {
                            j(err);
                        }
                    })));
                    this.refresh();
                },
            });
        },

        isDeleteForbidden(item) {
            const labels = item.metadata.labels || [];
            const isIngressController = !!labels.find(item => item.key === 'kubernetes.io/app' && item.value === 'ingress-nginx');
            const isMaster = !!labels.find(item => item.key === 'node-role.kubernetes.io/master');
            const isSystem = !!labels.find(item => item.key === 'system/helm' && item.value === 'true');
            return isIngressController || isMaster || isSystem;
        },
        deleteItem(item) {
            this.$eConfirm({
                message: `Confirm to delete node ${item.metadata.name}?`,
                title: 'Delete',
                ok: async () => {
                    await workloadService.deleteResourceWithoutNamespace({
                        pathParams: {
                            cluster: this.instance.clusterName,
                            resource: 'nodes',
                            name: get(item, 'metadata.name'),
                        },
                    });
                    this.refresh();
                },
            });
        },
    },
};
</script>

<style module>
  .master_flag{
    display: inline-block;
    border-radius: 50%;
    background: #508ae2;
    color: #fff;
    height: 18px;
    width: 18px;
    line-height: 18px;
    text-align: center;
    font-size: 12px;
    margin-right: 4px;
  }
  .table :global(.el-table-column--selection .cell) {
    padding: 0 14px 0 10px !important;
  }
</style>
