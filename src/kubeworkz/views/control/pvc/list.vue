<template>
  <el-row :class="$style.root">
    <el-row>
      <el-button
        type="primary"
        :disabled="isReview"
        icon="el-icon-plus"
        @click="toCreate"
      >
        Create a storage claim
      </el-button>
      <el-button
        :disabled="!currentDelPvc || isReview"
        @click="deleteBatch"
      >
        Batch deletion
      </el-button>
      <el-button
        square
        icon="el-icon-refresh-right"
        @click="refresh"
      />
      <inputSearch
        v-model="filterName"
        placeholder="Please enter name to search"
        position="right"
        @search="onSearch"
      />
    </el-row>
    <el-row>
      <x-request
        ref="request"
        :service="service"
        :params="requestParam"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading }">
          <el-table
            ref="multipleTable"
            v-loading="loading"
            :class="$style.table"
            :data="data ? data.list : []"
            style="width: 100%"
            border
            @sort-change="tableSortChange"
            @selection-change="selectionChange"
          >
            <el-table-column
              type="selection"
              width="38"
            />
            <el-table-column
              prop="metadata.name"
              label="Name"
              :show-overflow-tooltip="true"
              sortable
            >
              <template slot-scope="{ row }">
                <el-link
                  type="primary"
                  :to="{ path: `/control/${workload}/${row.metadata.name}`, query: $route.query }"
                >
                  {{ row.metadata.name }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="status.phase"
              label="State"
              :show-overflow-tooltip="true"
              width="80"
            />
            <el-table-column
              prop="spec.volumeName"
              label="Persistent storage"
              :show-overflow-tooltip="true"
              width="120"
            >
              <template slot-scope="{ row }">
                {{ getFun(row, 'spec.volumeName', '-') }}
              </template>
            </el-table-column>
            <el-table-column
              prop="spec.storageClassName"
              label="Storage class"
              :show-overflow-tooltip="true"
              width="120"
            >
              <template slot-scope="{ row }">
                {{ getFun(row, 'spec.storageClassName', '-') }}
              </template>
            </el-table-column>
            <el-table-column
              prop="spec.resources.requests.storage"
              label="Capacity"
              :show-overflow-tooltip="true"
              width="100"
            >
              <template slot-scope="{ row }">
                {{ getFun(row, 'spec.resources.requests.storage', '-') }}
              </template>
            </el-table-column>
            <el-table-column
              prop="status.capacity.storage"
              label="Actual capacity"
              :show-overflow-tooltip="true"
              width="100"
            >
              <template slot-scope="{ row }">
                {{ getFun(row, 'status.capacity.storage', '-') }}
              </template>
            </el-table-column>
            <el-table-column
              prop="spec.accessModes"
              label="Model"
              :show-overflow-tooltip="true"
              width="100"
            >
              <template slot-scope="{ row }">
                {{ row.spec.accessModes | accessModeFilter }}
              </template>
            </el-table-column>
            <el-table-column
              prop="mountBy"
              label="Mount By"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              prop="action"
              label="Action"
              width="180"
            >
              <template slot-scope="{ row }">
                <qz-link-group max="3">
                  <el-link
                    type="primary"
                    :disabled="isReview || row.status.phase !== 'Bound'"
                    @click="editItem(row)"
                  >
                    Set up
                  </el-link>
                  <el-link
                    type="primary"
                    :disabled="isReview"
                    @click="deleteItem(row)"
                  >
                    Delete
                  </el-link>
                  <el-link
                    type="primary"
                    :disabled="isReview || row.status.phase !== 'Bound'"
                    @click="editYAML(row)"
                  >
                    YAML settings
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
    </el-row>
    <create-pvc-dialog
      ref="pvc"
      @refresh="refresh"
    />
    <el-dialog
      title="Delete storage claim"
      :visible.sync="showDelCheck"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form
        label-width="120px"
      >
        <el-form-item label="Store claim name">
          <div style="word-break:break-all">
            {{ currentDelPvc }}
          </div>
        </el-form-item>
        <el-form-item label="Text confirmation">
          <el-input
            v-model="userInputPvc"
            type="textarea"
            :autosize="{ minRows: 3 }"
            placeholder="Please fill in the text above for secondary confirmation"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleClose">
          Cancel
        </el-button>
        <el-button
          type="primary"
          :loading="delLoading"
          :disabled="userInputPvc !== currentDelPvc"
          @click="handleDelete"
        >
          OK
        </el-button>
      </div>
    </el-dialog>
  </el-row>
</template>

<script>
import { pickBy, get as getFun } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import workloadExtendService from 'kubeworkz/services/k8s-extend-resource';
import PageMixin from 'kubeworkz/mixins/pagination';
import { toPlainObject as toPVCPlainObject } from 'kubeworkz/k8s-resources/persistentvolumeclaim';
import {
    PVC_MODE_TEXT_MAP,
} from 'kubeworkz';
import createPvcDialog from './create-pvc-dialog.vue';
import inputSearch from 'kubeworkz/elComponent/inputSearch/index.vue';

export default {
    metaInfo: {
        title: 'kubeworkz',
        titleTemplate: 'Persistentvolumeclaims - %s',
    },
    filters: {
        accessModeFilter(val) {
            return val[0] ? PVC_MODE_TEXT_MAP[val[0]] : '-';
        },
    },
    components: {
        createPvcDialog,
        inputSearch,
    },
    mixins: [ PageMixin ],
    data() {
        return {
            getFun,
            filterName: '',
            showDelCheck: false,
            currentDelPvc: '',
            userInputPvc: '',
            delLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            return !this.userResourcesPermission.persistentvolumeclaims;
        },
        service() {
            return workloadExtendService.getWorkloads;
        },
        instanceService() {
            return workloadService.getAPIV1Instance;

        },
        modifyService() {
            return workloadService.modifyAPIV1Instance;
        },
        deleteService() {
            return workloadService.deleteAPIV1Instance;
        },
        columns() {
            return [
                { type: 'selection', width: '60px' },
                { title: 'Name', name: 'metadata.name', sortable: true, textwrap: true },
                { title: 'State', name: 'status.phase', width: '80px' },
                { title: 'Persistent storage', name: 'spec.volumeName', width: '120px' },
                { title: 'Storage class', name: 'spec.storageClassName', width: '120px' },
                { title: 'Capacity', name: 'spec.resources.requests.storage', width: '100px' },
                { title: 'Actual capacity', name: 'status.capacity.storage' },
                { title: 'Model', name: 'spec.accessModes' },
                { title: 'Mount By', name: 'mountBy' },
                { title: 'Operation', name: 'operation', width: '160px' },
            ];
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    // resource: this.workload,
                    resource: 'pvc',
                },
                params: {
                    ...pickBy(this.pagination, i => !!i), // has to be this
                },
            };
        },
        workload() {
            return this.$route.params.workload;
        },
        toPlainObject() {
            return toPVCPlainObject;
        },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagination.pageNum > 1) {
                this.pagination.pageNum = this.pagination.pageNum - 1;
            }
            const list = (response.items || []).map(this.toPlainObject);
            list.forEach(item => {
                item.mountBy = (item.puresource.pods || []).map(item => item.metadata.name).join(',');
            });
            this.$nextTick(() => {
                this.$refs.multipleTable.clearSelection();
            });
            return {
                list,
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
        toCreate() {
            this.$refs.pvc.open();
        },
        async editYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: item.metadata.name,
                },
            };
            const response = await this.instanceService(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— YAML settings`,
                content: response,
                onSubmit: async content => {
                    await this.modifyService({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
        editItem(item) {
            this.$refs.pvc.open(item);
            // this.$router.push({
            //     path: `/control/${this.workload}/${item.metadata.name}/edit`,
            // });
        },
        deleteItem(item) {
            this.showDelCheck = true;
            this.currentDelPvc = item.metadata.name;
            this.userInputPvc = '';
            // this.$confirm({
            //     title: 'Delete',
            //     content: `Confirm to delete ${item.metadata.name}?`,
            //     ok: async () => {
            //         const reqParam = {
            //             pathParams: {
            //                 cluster: this.cluster,
            //                 namespace: this.namespace,
            //                 resource: this.workload,
            //                 name: item.metadata.name,
            //             },
            //         };
            //         await this.deleteService(reqParam);
            //         this.$refs.request.request();
            //     },
            // });
        },
        deleteBatch() {
            this.showDelCheck = true;
            this.userInputPvc = '';
        },
        handleDelete() {
            this.delLoading = true;
            const names = this.currentDelPvc.split(',');
            const arr = [];
            names.forEach(name => {
                const reqParam = {
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: this.workload,
                        name,
                    },
                };
                arr.push(
                    this.deleteService(reqParam)
                );
            });
            Promise.all(arr).then(() => {
                setTimeout(() => {
                    this.delLoading = false;
                    this.showDelCheck = false;
                    this.$refs.request.request();
                }, 2000);
            });
        },
        selectionChange(val) {
            const names = val.map(item => {
                return item.metadata.name;
            });
            this.currentDelPvc = names.join(',');
        },
        handleClose() {
            this.showDelCheck = false;
            this.currentDelPvc = '';
            this.userInputPvc = '';
            this.$refs.request.request();
        },
    },
};
</script>

<style module>
.root :global(.el-row) + :global(.el-row) {
  margin-top: 12px;
}
.table :global(.el-table-column--selection .cell) {
  padding: 0 14px 0 10px !important;
}
</style>
