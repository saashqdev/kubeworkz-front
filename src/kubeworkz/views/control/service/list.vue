<template>
  <div>
    <div style="margin-bottom: 12px">
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
    <div :key="workload">
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
            <template v-if="['services'].includes(workload)">
              <el-table-column
                prop="spec.type"
                label="Type"
                width="120"
              />
              <el-table-column
                prop="spec.ports"
                label="Internal access address"
                width="160"
              >
                <template slot-scope="{ row }">
                  <el-tooltip
                    effect="dark"
                    content="Top Center 提示文字"
                    placement="top"
                  >
                    <div
                      slot="content"
                      v-html="(row.spec.ports || []).map(item => item.text).join('<br/>')"
                    />
                    <div :class="$style.textEllipsis">
                      {{ (row.spec.ports || []).map(item => item.text).join(', ') }}
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column
                prop="spec.clusterIP"
                label="	Cluster IP"
                width="100"
                :show-overflow-tooltip="true"
              />
            </template>
            <template v-if="['ingresses'].includes(workload)">
              <el-table-column
                prop="outside"
                label="	External access address"
                width="160"
                :show-overflow-tooltip="true"
              >
                <template slot-scope="{ row }">
                  {{ row.outside || '-' }}
                </template>
              </el-table-column>
              <el-table-column
                prop="spec.rules"
                label="	Rule"
                width="200"
              >
                <template slot-scope="{ row }">
                  <el-tooltip
                    effect="dark"
                    content="Top Center prompt text"
                    placement="top"
                  >
                    <div
                      slot="content"
                      v-html="ingressRuleFilter(row).join('<br/>')"
                    />
                    <div :class="$style.textEllipsis">
                      {{ ingressRuleFilter(row).join(', ') }}
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
            </template>
            <el-table-column
              prop="metadata.creationTimestamp"
              label="Creation time"
              width="170"
              :show-overflow-tooltip="true"
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
                <qz-link-group
                  :key="workload"
                  max="3"
                >
                  <el-link
                    type="primary"
                    :disabled="isReview"
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
                    :disabled="isReview"
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
    </div>
  </div>
</template>

<script>
import { pickBy, get as getFun } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import workloadExtendService from 'kubeworkz/services/k8s-extend-resource';
import PageMixin from 'kubeworkz/mixins/pagination';
import { toPlainObject as toServicePlainObject } from 'kubeworkz/k8s-resources/service';
import { toPlainObject as toIngressPlainObject } from 'kubeworkz/k8s-resources/ingress';
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
            filterName: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userRole: get('scope/userRole'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            const keyMap = {
                services: 'services',
                ingresses: 'ingresses',
            };
            return !this.userResourcesPermission[keyMap[this.workload]];
        },
        service() {
            switch (this.workload) {
                case 'services':
                    return workloadExtendService.getWorkloads;
                case 'ingresses':
                    return workloadService.getNetworking;
                default:
                    return null;
            }
        },
        instanceService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.getAPIV1Instance;
                case 'ingresses':
                    return workloadService.getNetworkingInstance;
                default:
                    return null;
            }
        },
        modifyService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.modifyAPIV1Instance;
                case 'ingresses':
                    return workloadService.modifyNetworkingInstance;
                default:
                    return null;
            }
        },
        deleteService() {
            switch (this.workload) {
                case 'services':
                    return workloadService.deleteAPIV1Instance;
                case 'ingresses':
                    return workloadService.deleteNetworkingInstance;
                default:
                    return null;
            }
        },
        workloadLiteral() {
            switch (this.workload) {
                case 'services':
                    return 'Service';
                case 'ingresses':
                    return 'Load balancing';
                default:
                    return '';
            }
        },
        columns() {
            switch (this.workload) {
                case 'services':
                    return [
                        { title: 'Name', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: 'Type', name: 'spec.type', width: '80px' },
                        { title: 'Internal access address', name: 'spec.ports', width: '120px', type: 'tag' },
                        { title: 'Cluster IP', name: 'spec.clusterIP', width: '100px' },
                        { title: 'Creation time', name: 'metadata.creationTimestamp', width: '160px', sortable: true },
                        { title: 'Operation', name: 'operation', width: '160px' },
                    ];

                case 'ingresses':
                    return [
                        { title: 'Name', name: 'metadata.name', sortable: true, textwrap: true },
                        { title: 'External access address', name: 'outside', width: '120px' },
                        { title: 'Rule', name: 'spec.rules', width: '200px' },
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
                case 'services':
                    return toServicePlainObject;
                case 'ingresses':
                    return toIngressPlainObject;
                default:
                    return () => ({});
            }
        },
    },
    watch: {
        columns() {
            this.pagination.sortName = 'metadata.creationTimestamp';
            this.pagination.sortOrder = 'desc';
            this.pagination.sortFunc = 'time';
            this.$refs.request.resetData();
        },
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
        this.filterName = '';
    },
    methods: {
        ingressRuleFilter(item) {
            const strArr = [];
            const rules = getFun(item, 'spec.rules', []);
            rules.forEach(rule => {
                const host = getFun(rule, 'host');
                const paths = getFun(rule, 'http.paths', []);
                paths.forEach(path => {
                    const target = `${getFun(path, 'backend.service.name', '')}:${getFun(path, 'backend.service.port.number', '')}`;
                    const source = `${host}${getFun(path, 'path', '')}`;
                    strArr.push(`${source}->${target}`);
                });
            });
            return strArr;
        },
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
                    ...this.requestParam.pathParams,
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
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/edit`,
            });
        },
        deleteItem(item) {
            this.$eConfirm({
                title: 'Delete',
                message: `Confirm delete of ${item.metadata.name}?`,
                width: '460px',
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            ...this.requestParam.pathParams,
                            name: item.metadata.name,
                        },
                    };
                    if (this.workload === 'services') {
                        if (item.spec.template === 'headless' && !item.spec.enableSelecter) {
                            try {
                                await this.deleteEndpoints(item.metadata.name);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                    await this.deleteService(reqParam);
                    this.$refs.request.request();
                },
            });
        },
        async deleteEndpoints(name) {
            await workloadService.deleteAPIV1Instance({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'endpoints',
                    name,
                },
                noAlert: true,
            });
        },
    },
};
</script>

<style module>
.textEllipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
