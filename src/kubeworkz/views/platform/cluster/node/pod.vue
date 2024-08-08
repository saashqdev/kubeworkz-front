<template>
  <div>
    <div style="margin-bottom:12px;overflow:hidden">
      <inputSearch placeholder="Please enter name to search" position="right" @search="onSearch"/>
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
          @sort-change="tableSortChange"
        >
          <el-table-column
            prop="metadata.name"
            label="Pod name"
            :show-overflow-tooltip="true"
            sortable
          >
          </el-table-column>
          <el-table-column
            prop="status.podIP"
            label="IP"
            :show-overflow-tooltip="true"
            width="100"
          >
          </el-table-column>
          <el-table-column
            prop="status.phase"
            label="Replica status"
            :show-overflow-tooltip="true"
            sortable
            width="120"
          >
          </el-table-column>
          <el-table-column
            prop="status.restartCount"
            label="Number of restarts"
            :show-overflow-tooltip="true"
            width="70"
          >
          </el-table-column>
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
              {{ row.status.memoryUsage && row.status.memoryUsage.toFixed(2)  }} Mi
            </template>
          </el-table-column>
          <el-table-column
            prop="metadata.namespace"
            label="Namespace"
            :show-overflow-tooltip="true"
            width="100"
          >
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
                <el-link type="primary" @click="viewYAML(row)">Check the details</el-link>
                <el-link type="primary" @click="deleteItem(row)">Delete</el-link>
              </qz-link-group>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="float:right;margin-top:12px"
          v-if="data && calculatePages(data.total) > 0"
          @size-change="pageSizeChange"
          @current-change="pageNumChange"
          :current-page="pagenation.pageNum"
          :page-sizes="[10, 20, 30, 40, 50, 100]"
          :page-size="pagenation.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="data.total"
          background
        />
      </template>
    </x-request>
  </div>
</template>

<script>
import { pickBy } from 'lodash';
import workloadService from 'kubeworkz/services/k8s-resource';
import PageMixin from 'kubeworkz/mixins/pagenation';
import { toPlainObject as toPodPlainObject } from 'kubeworkz/k8s-resources/pod';
import inputSearch from 'kubeworkz/elComponent/inputSearch/index.vue';
export default {
    metaInfo: {
        title: 'kubeworkz',
        titleTemplate: '%s - Pod',
    },
    mixins: [ PageMixin ],
    components: {
        inputSearch,
    },
    data() {
        return {
            service: workloadService.getResourceListWithoutNamespace,
            columns: [
                { title: 'Pod name', name: 'metadata.name', sortable: true, textwrap: true },
                { title: 'IP', name: 'status.podIP', width: '100px' },
                { title: 'Replica status', name: 'status.phase', width: '120px', sortable: true },
                { title: 'Number of restarts', name: 'status.restartCount', width: '70px' },
                { title: 'CPU usage', name: 'status.cpuUsage', width: '100px' },
                { title: 'Memory usage', name: 'status.memoryUsage', width: '100px' },
                { title: 'Namespace', name: 'metadata.namespace', width: '100px' },
                { title: 'Creation time', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                { title: 'Operation', name: 'operation', width: '120px' },
            ],
        };
    },
    computed: {
        cluster() {
            return this.$route.params.name;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    resource: 'pods',
                },
                params: {
                    ...pickBy(this.pagenation, i => !!i), // has to be this
                    fieldSelector: `spec.nodeName=${this.$route.params.nodename}`,
                },
            };
        },
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
            this.pagenation.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            let temp = content ? `metadata.name~${content}` : undefined;
            if(this.pagenation.selector === temp) {
                this.refresh()
            }
            this.pagenation.selector = temp;
        },
        async viewYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: item.metadata.namespace,
                    resource: 'pods',
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getAPIV1Instance(reqParam);

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
                            cluster: this.cluster,
                            namespace: item.metadata.namespace,
                            resource: 'pods',
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
