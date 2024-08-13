<template>
  <div>
    <div style="overflow: hidden;">
      <elInputSearch
        placeholder="Please enter name to search"
        position="right"
        @search="onSearch"
      />
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="requestParam"
      :processor="resolver"
      style="margin-top: 12px;"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :data="data ? data.list : []"
          style="width: 100%"
          border
          :default-sort="defaultSort"
          @sort-change="tableSortChange"
        >
          <el-table-column
            prop="metadata.name"
            label="Pod name"
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
            prop="status.podIP"
            label="IP"
            :show-overflow-tooltip="true"
            width="120"
          />
          <el-table-column
            prop="status.phase"
            label="Replica status"
            :show-overflow-tooltip="true"
            width="100"
          />
          <el-table-column
            prop="status.restartCount"
            label="Number of restarts"
            :show-overflow-tooltip="true"
            width="70"
          />
          <el-table-column
            prop="status.cpuUsage"
            label="CPU usage"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template slot-scope="{ row }">
              {{ row.status.cpuUsage && row.status.cpuUsage.toFixed(2) }} Cores
            </template>
          </el-table-column>
          <el-table-column
            prop="status.memoryUsage"
            label="Memory usage"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template slot-scope="{ row }">
              {{ row.status.memoryUsage && row.status.memoryUsage.toFixed(2) }} Mi
            </template>
          </el-table-column>
          <el-table-column
            prop="metadata.creationTimestamp"
            label="Creation time"
            :show-overflow-tooltip="true"
            width="160"
            sortable
          >
            <template slot-scope="{ row }">
              {{ row.metadata.creationTimestamp | formatLocaleTime }}
            </template>
          </el-table-column>
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
                  @click="view(row)"
                >
                  Check the details
                </el-link>
                <el-link
                  type="primary"
                  :disabled="isReview"
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
  </div>
</template>

<script>
import { pickBy } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import workloadExtendService from 'kubeworkz/services/k8s-extend-resource';
import PageMixin from 'kubeworkz/mixins/pagenation';
import { toPlainObject as toPodPlainObject } from 'kubeworkz/k8s-resources/pod';
export default {
    metaInfo: {
        title: 'kubeworkz',
        titleTemplate: 'Pod - %s',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            service: workloadExtendService.getWorkloads,
            columns: [
                { title: 'Pod name', name: 'metadata.name', sortable: true, textwrap: true },
                { title: 'IP', name: 'status.podIP', width: '100px' },
                { title: 'Replica status', name: 'status.phase', width: '120px', sortable: true },
                { title: 'Number of restarts', name: 'status.restartCount', width: '70px' },
                { title: 'CPU usage', name: 'status.cpuUsage', width: '100px' },
                { title: 'Memory usage', name: 'status.memoryUsage', width: '100px' },
                { title: 'Creation time', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                { title: 'Operation', name: 'operation', width: '120px' },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userRole: get('scope/userRole'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            return !this.userResourcesPermission.pods;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                },
                params: {
                    ...pickBy(this.pagenation, i => !!i), // has to be this
                },
            };
        },
        workload() {
            return this.$route.params.workload;
        },
    },
    created() {
        this.pagenation.sortName = 'metadata.creationTimestamp';
        this.pagenation.sortOrder = 'desc';
        this.pagenation.sortFunc = 'time';
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            const list = (response.items || []).map(toPodPlainObject);
            return {
                list,
                total: response.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        onSort({ order, name }) {
            this.pagenation.sortOrder = order;
            this.pagenation.sortName = `${name}`;
            this.pagenation.sortFunc = name === 'metadata.creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.pagenation.selector === temp) {
                this.refresh();
            }
            this.pagenation.selector = temp;
        },
        async view(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getAPIV1Instance(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— YAML settings`,
                content: response,
                editorOption: {
                    readOnly: true,
                },
            });

        },
        deleteItem(item) {
            this.$eConfirm({
                title: 'Delete',
                message: `Confirm delete ${item.metadata.name}?`,
                width: '460px',
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: this.workload,
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteAPIV1Instance(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
