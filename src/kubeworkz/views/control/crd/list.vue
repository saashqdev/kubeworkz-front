<template>
  <div>
    <template v-if="isInSubRoute">
      <router-view />
    </template>
    <x-request
      v-else
      ref="request"
      :service="service"
      :params="reqParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <el-table
          v-loading="loading"
          :data="data ? data.list : []"
          style="width: 100%"
          border
        >
          <el-table-column
            prop="metadata.name"
            label="Name"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="group"
            label="Group"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="versions"
            label="Version"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link
                v-for="version in row.versions"
                :key="version"
                type="primary"
                :to="{ path: `/control/crd/${level}/${row.metadata.name}/${version}`, query: $route.query }"
                style="margin-right: 8px"
              >
                {{ version }}
              </el-link>
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


        <!-- <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data ? data.list : []"
          :error="error"
          :resizable="true"
          @sort="onSort"
        >
          <template #[`item.versions`]="{ item }">
            <u-link
              v-for="version in item.versions"
              :key="version"
              :to="{ path: `/control/crd/${level}/${item.metadata.name}/${version}`}"
            >
              {{ version }}
            </u-link>
          </template>
          <template #noData>
            <template v-if="pagination.selector">
              If no relevant content is found, you can adjust the keywords and search again.
            </template>
            <template v-else>
              There are no custom resources yet
            </template>
          </template>
          <template #error>
            Failed to obtain data, please
            <u-link @click="refresh">
              Retry
            </u-link>
          </template>
        </kube-table>
        <u-page
          v-if="data && calculatePages(data.total) > 0"
          :page="pagination.pageNum"
          :count="data.total"
          :page-size="pagination.pageSize"
          :total="calculatePages(data.total)"
          @select="selectPage"
        /> -->
      </template>
    </x-request>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import workloadService from 'kubeworkz/services/k8s-resource';
import { get } from 'vuex-pathify';
import PageMixin from 'kubeworkz/mixins/pagination';
import {
    toPlainObject as toCRDPlainObject,
} from 'kubeworkz/k8s-resources/crd';
export default {
    mixins: [ PageMixin ],
    props: {
        selector: String,
        refreshKey: Number,
    },
    data() {
        return {
            service: workloadService.getCRD,
            columns: [
                { title: 'Name', name: 'metadata.name', textwrap: true },
                { title: 'Group', name: 'group', textwrap: true },
                { title: 'Version', name: 'versions', textwrap: true },
            ],
        };
    },
    computed: {
        isInSubRoute() {
            return this.$route.name === 'crd.detail';
        },
        cluster: get('scope/cluster@value'),
        reqParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                },
                params: {
                    ...this.pagination,
                    selector: `${this.selector},spec.scope=${this.level}`,
                },
            };
        },
        level() {
            return this.$route.params.level;
        },
    },
    watch: {
        refreshKey() {
            this.$refs.request.request();
        },
        level() {
            Object.assign(this.pagination, {
                pageNum: 1,
                pageSize: 10,
                sortOrder: 'asc',
                sortName: undefined,
                selector: '',
            });
        },
    },
    methods: {
        resolver(response) {
            console.log(response);
            return {
                list: (getFunc(response, 'items') || []).map(toCRDPlainObject),
                total: response.total,
            };
        },
        onSort({ order, name }) {
            this.pagination.sortOrder = order;
            this.pagination.sortName = name;
            this.pagination.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        refresh() {
            this.$refs.request.request();
        },
    },
};
</script>

<style>

</style>
