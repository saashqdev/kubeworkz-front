<template>
  <div>
    <div style="margin-bottom: 12px;">
      <el-button
        type="primary"
        @click="createYAML"
      >
        Created using YAML
      </el-button>
      <el-button
        icon="el-icon-refresh-right"
        square
        @click="refresh"
      />
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
      <template slot-scope="{ data, loading, error }">
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
            prop="pool"
            label="Storage cluster"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="provisioner"
            label="Type"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="reclaimPolicy"
            label="Release strategy"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="operation"
            label="Operation"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
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
          :current-page="pagination.pageNum"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="data.total"
          background
          @size-change="pageSizeChange"
          @current-change="pageNumChange"
        />
      </template>
    </x-request>
  </div>
</template>

<script>
import { get } from 'lodash';
import workloadService from 'kubeworkz/services/k8s-resource';
import PageMixin from 'kubeworkz/mixins/pagination';
import {
    toPlainObject as toStoragePlainObject,
    getDefaultModel as getStorageDefaultModel,
    toK8SObject as toStorageK8SObject,
} from 'kubeworkz/k8s-resources/storageclass';
import {
    CEPH_TYPE_MAP,
} from 'kubeworkz';

export default {
    filters: {
        cephTypeText(val) {
            return CEPH_TYPE_MAP[val] || val;
        },
    },
    components: {
        // createStorageclassModal,
    },
    mixins: [ PageMixin ],

    props: {
        instance: Object,
    },
    data() {
        return {
            service: workloadService.getStorage,
            selectRows: [],
            // columns: [
            //     { title: 'Name', name: 'metadata.name', sortable: true },
            //     { title: 'Storage cluster', name: 'pool' },
            //     { title: 'Type', name: 'provisioner' },
            //     { title: 'Release strategy', name: 'reclaimPolicy' },
            //     { title: 'Operation', name: 'operation', width: '180px' },
            // ],
        };
    },
    computed: {
        clusterName() {
            return this.instance && this.instance.clusterName;
        },
        isControlCluster() {
            return !this.instance.isMemberCluster;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'storageclasses',
                },
                params: {
                    ...this.pagination, // has to be this
                },
            };
        },
        columns() {
            return [
                { title: 'Name', name: 'metadata.name', sortable: true },
                { title: 'Storage cluster', name: 'pool' },
                { title: 'Type', name: 'provisioner' },
                { title: 'Release strategy', name: 'reclaimPolicy' },
                { title: 'Operation', name: 'operation', width: '180px' },
            ];
        },
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagination.pageNum > 1) {
                this.pagination.pageNum = this.pagination.pageNum - 1;
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
            this.pagination.sortOrder = order;
            this.pagination.sortName = `${name}`;
            this.pagination.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.pagination.selector === temp) {
                this.refresh();
            }
            this.pagination.selector = temp;
        },
        cephCluster(item) {
            return get(item, 'metadata.annotations["ceph-cluster-name"]')
            || get(item, 'metadata.annotations["cephfs-cluster-name"]');
        },
        createYAML() {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'storageclasses',
                },
            };
            const content = toStorageK8SObject(getStorageDefaultModel());
            this.$editResource({
                title: 'Create storage class',
                content,
                onSubmit: async content => {
                    await workloadService.createStorage({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
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
                            resource: 'storageclasses',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteStorage(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
