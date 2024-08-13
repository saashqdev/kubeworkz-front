<template>
  <div>
    <div
      style="margin-bottom: 12px;overflow:hidden"
    >
      <inputSearch
        placeholder="Please enter name to search"
        position="right"
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
          />
          <el-table-column
            prop="status.phase"
            label="Status"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="type"
            label="Type"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.type || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="provisioner"
            label="Provisioner"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.provisioner | cephTypeText }}
            </template>
          </el-table-column>
          <el-table-column
            prop="spec.accessModes"
            label="Access mode"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="spec.storageClassName"
            label="Storage class"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="spec.capacity.storage"
            label="Capacity"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="spec.claimRef.name"
            label="Claim Ref"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="operation"
            label="Operation"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
                <el-link
                  type="primary"
                  @click="viewYAML(row)"
                >
                  Check the details
                </el-link>
                <el-link
                  type="primary"
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
  </div>
</template>

<script>
import { get } from 'lodash';
import workloadService from 'kubeworkz/services/k8s-resource';
import PageMixin from 'kubeworkz/mixins/pagenation';
import {
    toPlainObject as toStoragePlainObject,
} from 'kubeworkz/k8s-resources/persistentvolumes';
import taintDialog from '../dialogs/taint.vue';
import {
    CEPH_TYPE_MAP,
} from 'kubeworkz';
import inputSearch from 'kubeworkz/elComponent/inputSearch/index.vue';

export default {
    filters: {
        cephTypeText(val) {
            return CEPH_TYPE_MAP[val] || val || '-';
        },
    },
    components: {
        taintDialog,
        inputSearch,
    },
    mixins: [ PageMixin ],

    props: {
        instance: Object,
    },
    data() {
        return {
            service: workloadService.getResourceListWithoutNamespace,
            selectRows: [],
            columns: [
                { title: 'Name', name: 'metadata.name', sortable: true, textwrap: true },
                { title: 'Status', name: 'status.phase' },
                { title: 'Type', name: 'type' },
                { title: 'Provisioner', name: 'provisioner' },
                { title: 'Access mode', name: 'spec.accessModes' },
                { title: 'Storage class', name: 'spec.storageClassName' },
                { title: 'Capacity', name: 'spec.capacity.storage' },
                { title: 'Claim Ref', name: 'spec.claimRef.name', textwrap: true },
                { title: 'Operation', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'persistentvolumes',
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            return {
                list: (response.items || []).map(toStoragePlainObject),
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
        onSearch(content) {
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.pagenation.selector === temp) {
                this.refresh();
            }
            this.pagenation.selector = temp;
        },
        cephCluster(item) {
            return get(item, 'metadata.annotations["ceph-cluster-name"]')
            || get(item, 'metadata.annotations["cephfs-cluster-name"]');
        },
        async viewYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'persistentvolumes',
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getResourceWithoutNamespace(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— View YAML`,
                content: response,
                editorOption: {
                    readOnly: true,
                },
            });
        },
        deleteItem(item) {
            this.$eConfirm({
                title: 'Delete',
                message: `Confirm to delete ${item.metadata.name}?`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.instance.clusterName,
                            resource: 'persistentvolumes',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteResourceWithoutNamespace(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
