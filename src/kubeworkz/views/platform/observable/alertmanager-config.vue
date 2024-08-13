<template>
  <u-linear-layout direction="vertical">
    <x-request
      ref="request"
      :service="getAlarmManagerConfigService()"
      :params="{}"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data || []"
          :error="error"
        >
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list>
                <u-link-list-item
                  :disabled="item.cluster.status !== 'normal'"
                  @click="editItem(item)"
                >
                  {{ item.config ? 'Set up': 'Create' }}
                </u-link-list-item>
                <u-link-list-item
                  v-if="item.config"
                  :disabled="item.cluster.status !== 'normal'"
                  @click="deleteItem(item)"
                >
                  Delete
                </u-link-list-item>
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            There is no alarm policy group yet. Please create a cluster first and then create an alert policy group.
          </template>
          <template #error>
            Failed to obtain data, please<u-link @click="refresh">
              Retry
            </u-link>
          </template>
        </kube-table>
      </template>
    </x-request>
    <edit-dialog
      ref="editDialog"
      @refresh="refresh"
    />
  </u-linear-layout>
</template>

<script>
import { get as geFunc } from 'lodash';
import workloadService from 'kubeworkz/services/k8s-resource';
import clusterService from 'kubeworkz/services/cluster';
import { toPlainObject as toGlobalAlertPlainObject } from 'kubeworkz';
import editDialog from './alertmanager-dialog.vue';
const SECRET_NAMESPACE = 'kubeworkz-monitoring';


export default {
    components: {
        editDialog,
    },
    metaInfo() {
        return {
            title: 'Global alert configuration - kubeworkz',
        };
    },
    data() {
        return {
            columns: [
                { title: 'Cluster', name: 'cluster.clusterName' },
                { title: 'Alert configuration', name: 'config.metadata.name' },
                { title: 'Operation', name: 'operation', width: '180px' },
            ],
        };
    },
    computed: {
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
        getAlarmManagerConfigService() {
            return async () => {
                const clusterRes = await clusterService.getClusters({
                    params: {
                        // status: 'normal',
                    },
                });
                const list = geFunc(clusterRes, 'items', []);
                const response = await Promise.all(list.map(async l => {
                    try {
                        const res = await workloadService.getAPIV1Instance({
                            pathParams: {
                                cluster: l.clusterName,
                                namespace: SECRET_NAMESPACE,
                                resource: 'secrets',
                                name: 'alertmanager-kubeworkz-monitoring-alertmanager',
                            },
                            silent: true,
                        });
                        return {
                            cluster: l,
                            config: res && toGlobalAlertPlainObject(res),
                        };
                    } catch (err) {
                        return {
                            cluster: l,
                            config: null,
                        };
                    }
                }));
                return response;
            };
        },
        resolver(response) {
            return response;
        },
        refresh() {
            this.$refs.request.request();
        },

        toCreate() {
            this.$refs.editDialog.open();
            // this.$router.push({ name: 'control.workload.create', params: this.$route.params });
        },
        view() {

        },
        editItem(item) {
            this.$refs.editDialog.open(item);
        },
        deleteItem(item) {
            this.$confirm({
                title: 'Delete',
                content: `Confirm to delete ${item.cluster.clusterName} global alert configuration?`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: item.cluster.clusterName,
                            namespace: SECRET_NAMESPACE,
                            resource: 'secrets',
                            name: 'alertmanager-kubeworkz-monitoring-alertmanager',
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
