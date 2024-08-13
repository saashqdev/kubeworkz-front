<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout direction="horizontal">
      <u-button
        icon="create"
        color="primary"
        @click="toCreate"
      >
        Create an alert policy group
      </u-button>
      <u-button
        icon="refresh"
        square
        @click="refresh"
      />
      <kube-input-search
        :align-right="true"
        placeholder="Please enter name to search"
        @search="onSearch"
      />
    </u-linear-layout>

    <x-request
      ref="request"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data ? data.list : []"
          :error="error"
          @sort="onSort"
        >
          <!-- <template #[`item.metadata.name`]="{ item }">
            <u-link :to="{path: `/control/${workload}/${item.metadata.name}`}">
              {{ item.metadata.name }}
            </u-link>
          </template> -->

          <template #[`item.metadata.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list :key="workload">
                <!-- <u-link-list-item @click="silentItem(item)">
                  Silence
                </u-link-list-item> -->
                <u-link-list-item @click="editItem(item)">
                  Set up
                </u-link-list-item>
                <u-link-list-item @click="deleteItem(item)">
                  Delete
                </u-link-list-item>
                <u-link-list-item @click="editYAML(item)">
                  YAML settings
                </u-link-list-item>
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            <template v-if="pagination.selector">
              If no relevant content is found, you can adjust the keywords and search again.
            </template>
            <template v-else>
              There are no alert policy groups yet <u-link @click="toCreate">
                Create now
              </u-link>
              Just one
            </template>
          </template>
          <template #error>
            Failed to obtain data, please
            <u-link @click="refresh">
              rerty
            </u-link>
          </template>
        </kube-table>
        <u-page
          v-if="data && calculatePages(data.total) > 1"
          :count="data.total"
          :page-size="pagination.pageSize"
          :total="calculatePages(data.total)"
          @select="selectPage"
        />
      </template>
    </x-request>
    <edit-dialog
      ref="editDialog"
      @refresh="refresh"
    />
  </u-linear-layout>
</template>

<script>
import { pickBy } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import PageMixin from 'kubeworkz/mixins/pagination';
import editDialog from './edit-dialog.vue';
import {
    specCRD,
} from '../utils';

export default {
    metaInfo() {
        return {
            title: 'Alert policy group - kubeworkz',
        };
    },
    components: {
        editDialog,
    },
    mixins: [ PageMixin ],
    data() {
        return {
            columns: [
                { title: 'Policy group name', name: 'metadata.name' },
                // { title: 'Founder', name: 'creater' },
                { title: 'Creation time', name: 'metadata.creationTimestamp', width: '180px' },
                { title: 'Operate', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
        namespace: get('scope/project@spec.namespace'),
        cluster: get('scope/cluster@value'),
        service() {
            return workloadService.getNamespaceCRResource;
        },
        deleteService() {
            return workloadService.deleteNamespaceCRResource;
        },
        instanceService() {
            return workloadService.getNamespaceCRResourceInstance;
        },
        modifyService() {
            return workloadService.modifyNamespaceCRResource;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    ...specCRD,
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
            return d => d;
        },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        resolver(response) {
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
            this.pagination.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            this.pagination.selector = content ? `metadata.name~${content}` : undefined;
        },
        toCreate() {
            this.$refs.editDialog.open();
            // this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        view() {

        },
        // silentItem(item) {

        // },
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
            this.$refs.editDialog.open(item);
        },
        deleteItem(item) {
            this.$confirm({
                title: 'Delete',
                content: `Confirm to delete ${item.metadata.name}?`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            ...this.requestParam.pathParams,
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
