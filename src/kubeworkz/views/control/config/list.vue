<template>
  <div>
    <div style="margin-bottom:12px">
      <el-button
        type="primary"
        :disabled="isReview"
        icon="el-icon-plus"
        @click="toCreate"
      >
        Create {{ workloadLiteral }}
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
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          :key="workload"
          v-loading="loading"
          :data="data ? data.list : []"
          style="width: 100%"
          border
          :default-sort="defaultSort"
          @sort-change="tableSortChange"
        >
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
            v-if="workload === 'secrets'"
            prop="type"
            label="Type"
            :show-overflow-tooltip="true"
            width="240"
          />
          <el-table-column
            prop="metadata.creationTimestamp"
            label="Creation time"
            width="170"
            sortable
          >
            <template slot-scope="{ row }">
              {{ row.metadata.creationTimestamp | formatLocaleTime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="action"
            label="Action"
            width="180"
          >
            <template slot-scope="{ row }">
              <qz-link-group max="3">
                <el-link
                  type="primary"
                  :disabled="!SECRET_TYPES.includes(row.type) || isReview"
                  @click="editItem(row)"
                >
                  Set up
                </el-link>
                <el-link
                  type="primary"
                  :disabled="isReview || (row.metadata.pureLabels || {})['system/defaultImagePullSecret'] === 'true'"
                  @click="deleteItem(row)"
                >
                  Delete
                </el-link>
                <el-link
                  type="primary"
                  :disabled="isReview"
                  @click="editYAML(row)"
                >
                  YAML Settings
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
import { pickBy } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import PageMixin from 'kubeworkz/mixins/pagination';
import { toPlainObject as toConfigmapPlainObject } from 'kubeworkz/k8s-resources/configmap';
import { toPlainObject as toSecretPlainObject } from 'kubeworkz/k8s-resources/secret';
import { SECRET_TYPES } from 'kubeworkz';
import inputSearch from 'kubeworkz/elComponent/inputSearch/index.vue';
export default {
    components: {
        inputSearch,
    },
    metaInfo() {
        return {
            title: `${this.workload} - kubeworkz`,
        };
    },
    mixins: [ PageMixin ],
    data() {
        return {
            SECRET_TYPES: SECRET_TYPES.map(s => s.value),
            filterName: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            const keyMap = {
                configmaps: 'configmaps',
                secrets: 'secrets',
            };
            return !this.userResourcesPermission[keyMap[this.workload]];
        },
        service() {
            return workloadService.getAPIV1;
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
        workloadLiteral() {
            switch (this.workload) {
                case 'configmaps':
                    return 'Configmap';
                case 'secrets':
                    return 'Secret';
                default:
                    return '';
            }
        },
        columns() {
            switch (this.workload) {
                case 'secrets':
                    return [
                        { title: 'Name', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: 'Type', name: 'type', width: '240px' },
                        { title: 'Creation time', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                        { title: 'Operation', name: 'operation', width: '160px' },
                    ];

                case 'configmaps':
                    return [
                        { title: 'Name', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: 'Creation time', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                        { title: 'Operation', name: 'operation', width: '160px' },
                    ];
                default:
                    return [];
            }

        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
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
            switch (this.workload) {
                case 'configmaps':
                    return toConfigmapPlainObject;
                case 'secrets':
                    return toSecretPlainObject;
                default:
                    return () => ({});
            }
        },
    },
    watch: {
        workload() {
            this.pagination.selector = '';
            this.filterName = '';
        },
    },
    created() {
        this.pagination.sortName = 'metadata.creationTimestamp';
        this.pagination.sortOrder = 'desc';
        this.pagination.sortFunc = 'time';
        this.pagination.selector = '';
    },
    methods: {
        resolver(response) {
            if ((response.items || []).length === 0 && response.total > 0 && this.pagination.pageNum > 1) {
                this.pagination.pageNum = this.pagination.pageNum - 1;
            }
            const list = (response.items || []).map(this.toPlainObject);
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
            this.pagination.sortFunc = name === 'metadata.creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.pagination.selector === temp) {
                this.refresh();
            }
            this.pagination.selector = temp;
        },
        toCreate() {
            this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        view() {

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
                title: `${item.metadata.name} —— YAML Settings`,
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
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/edit`,
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
                            namespace: this.namespace,
                            resource: this.workload,
                            name: item.metadata.name,
                        },
                    };
                    await this.deleteService(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style>

</style>
