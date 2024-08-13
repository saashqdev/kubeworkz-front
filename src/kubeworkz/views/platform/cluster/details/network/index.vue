<template>
  <div>
    <template v-if="isInSubPath">
      <router-view />
    </template>
    <template v-else>
      <div style="margin-bottom: 12px;">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="toCreate"
        >
          Create a network policy
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
              prop="metadata.namespace"
              label="Namespace"
              :show-overflow-tooltip="true"
              width="200"
            />
            <el-table-column
              prop="t"
              label="Operation"
              :show-overflow-tooltip="true"
              width="180"
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
                    @click="toEdit(row)"
                  >
                    Set up
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
    </template>
  </div>
</template>

<script>
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toNetworPolicyPlainObject,
} from 'kubeworkz/k8s-resources/networkPolicy';
import PageMixin from 'kubeworkz/mixins/pagenation';

import inputSearch from 'kubeworkz/elComponent/inputSearch/index.vue';
export default {
    components: {
        inputSearch,
    },
    mixins: [ PageMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            service: workloadService.getClusterNetworking,
            selectRows: [],
            columns: [
                { title: 'Name', name: 'metadata.name', sortable: true },
                { title: 'Namespace', name: 'metadata.namespace', width: '200px' },
                { title: 'Operation', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        isInSubPath() {
            return !this.$route.path.endsWith('network');
        },
        isControlCluster() {
            return !this.instance.isMemberCluster;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'networkpolicies',
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
    },
    methods: {
        toCreate() {
            this.$router.push({ path: `/platform/cluster/${this.instance.clusterName}/network/create` });
        },
        toEdit(item) {
            this.$router.push({ path: `/platform/cluster/${this.instance.clusterName}/network/edit/${item.metadata.namespace}/${item.metadata.name}` });
        },
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagenation.pageNum > 1) {
                this.pagenation.pageNum = this.pagenation.pageNum - 1;
            }
            return {
                list: response.items.map(toNetworPolicyPlainObject),
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
        async viewYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'networkpolicies',
                    namespace: item.metadata.namespace,
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getNetworkingInstance(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— View YAML`,
                content: response,
                editorOption: {
                    readOnly: true,
                },
            });
        },
        deleteItem(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.instance.clusterName,
                    resource: 'networkpolicies',
                    namespace: item.metadata.namespace,
                    name: item.metadata.name,
                },
            };
            this.$eConfirm({
                message: `Confirm to delete network policy ${item.metadata.name}?`,
                title: 'Delete',
                ok: async () => {
                    await workloadService.deleteNetworkingInstance(reqParam);
                    this.refresh();
                },
            });
        },
    },
};
</script>

<style>

</style>
