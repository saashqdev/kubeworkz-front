<template>
  <div>
    <div class="global-row-margin-bottom">
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="toCreate"
      >
        Create log task
      </el-button>
      <el-button
        square
        icon="el-icon-refresh-right"
        @click="refresh"
      />
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
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :data="data ? data.list : []"
          style="width: 100%"
          :default-sort="defaultSort"
          @sort-change="tableSortChange"
        >
          <el-table-column
            prop="name"
            label="Log task name"
            :show-overflow-tooltip="true"
            sortable
          >
            <template slot-scope="{ row }">
              <el-link
                type="primary"
                @click="$router.replace({ path: `/control/${workload}/${row.name}`, query: $route.query })"
              >
                {{ row.name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="labelSelector"
            label="Tag selector"
          >
            <template slot-scope="{ row }">
              <tagList
                :data="row.labelSelector"
                :item-formatter="item => `${item.key}:${item.value}`"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="pathCollection"
            label="Log path"
          >
            <template slot-scope="{ row }">
              <tagList
                :data="row.pathCollection"
                :item-formatter="item => item"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="Creation time"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.createTime | formatLocaleTime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="operate"
            label="Operate"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template slot-scope="{ row }">
              <el-link
                type="primary"
                @click="editItem(row)"
              >
                Set up
              </el-link>
              <el-link
                type="primary"
                style="margin-left:8px"
                @click="deleteItem(row)"
              >
                Delete
              </el-link>
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
import { pickBy, flatten } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import logseerService from 'kubeworkz/services/logseer';
import PageMixin from 'kubeworkz/mixins/pagenation';
import {
    PVC_MODE_TEXT_MAP,
} from 'kubeworkz';
import { LOG_TYPE } from 'kubeworkz';
import {
    toPlainObject as toLogconfgPlainObject,
} from 'kubeworkz/k8s-resources/logconfigs-new';
import tagList from 'kubeworkz/elComponent/tagList.vue';

export default {
    components: {
        tagList,
    },
    metaInfo: {
        title: 'kubeworkz',
        titleTemplate: 'Log task management - %s',
    },
    filters: {
        logType(val) {
            return LOG_TYPE[val];
        },
        accessModeFilter(val) {
            return val[0] ? PVC_MODE_TEXT_MAP[val[0]] : '-';
        },
    },
    mixins: [ PageMixin ],
    data() {
        return {
            filtervalue: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        service() {
            return logseerService.getLogconfigList;
        },
        instanceService() {
            return workloadService.getKubeworkzResourceInstance;

        },
        modifyService() {
            return workloadService.modifyKubeworkzResource;
        },
        deleteService() {
            return logseerService.deleteLogconfig;
        },
        columns() {
            return [
                { title: 'Log task name', name: 'metadata.name', sortable: true, textwrap: true },
                { title: 'Log source type', name: 'type', width: '120px' },
                { title: 'Tag selector', name: 'metadata.labels', width: '180px', type: 'tag', cellprops: {
                    formatter(item) { return `${item.key}=${item.value}`; },
                    isChip: true,
                } },
                { title: 'Log path', name: 'path', width: '200px', textwrap: true },
                { title: 'Creation time', name: 'metadata.creationTimestamp', width: '180px' },
                { title: 'Operate', name: 'operation', width: '160px' },
            ];

        },
        requestParam() {
            return {
                pathParams: {},
                params: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    limit: this.pagenation.pageSize,
                    offset: (this.pagenation.pageNum - 1) * this.pagenation.pageSize,
                    sortby: this.pagenation.sortName,
                    asc: this.pagenation.sortOrder === 'asc',
                    filterby: 'name',
                    filtervalue: this.filtervalue,
                },
            };
        },
        workload() {
            return this.$route.params.workload;
        },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        resolver(response) {
            const list = (response.items || []).map(toLogconfgPlainObject).map(item => {
                let pathCollection = item.inputs.reduce((pre, cur) => {
                    pre.push(...(cur.paths.map(p => p.path)));
                    return pre;
                }, []);
                pathCollection = [ ...new Set(pathCollection) ];
                item.pathCollection = pathCollection;
                return item;
            });
            console.log(list);
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
            this.filtervalue = content;
        },
        toCreate() {
            this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        getPaths(inputs) {
            return flatten(inputs.map(p => p.paths.map(t => t.path))).join(',') || '-';
        },
        editItem(item) {
            this.$router.push({
                path: `/control/${this.workload}/${item.name}/edit`,
            });
        },
        deleteItem(item) {
            this.$confirm({
                title: 'Delete',
                content: `Confirm to delete ${item.name}?`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: this.workload,
                            name: item.name,
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
