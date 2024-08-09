<template>
  <u-linear-layout direction="vertical">
    <u-linear-layout>
      <u-text>Cluster</u-text>
      <cluster-selector v-model="cluster" style="width:200px" />
      <u-button
        icon="create"
        color="primary"
        @click="toCreate"
      >
        Create alert rules
      </u-button>
    </u-linear-layout>
    <x-request
      v-if="cluster"
      ref="request"
      :service="service"
      :params="params"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data ? data.list : []"
          :error="error"
          resizable
        >
          <template #[`item.metadata.name`]="{ item }">
            {{ item.metadata.name }}
          </template>
          <template #[`item.spec.rule.severity`]="{ item }">
            {{ item.spec.rule.severity | criticalFilter }}
          </template>
          <template #[`item.metadata.creationTimestamp`]="{ item }">
            {{ item.metadata.creationTimestamp | formatLocaleTime }}
          </template>
          <template #[`item.regularnum`]="{ item }">
            {{ getRuleSum(item) }}
          </template>
          <template #[`item.operation`]="{ item }">
            <u-linear-layout gap="small">
              <u-link-list>
                <u-link-list-item @click="editItem(item)">
                  Set up
                </u-link-list-item>
                <u-link-list-item @click="deleteItem(item)">
                  Delete
                </u-link-list-item>
                <!-- <u-link-list-item @click="editYAML(item)">
                  YAML settings
                </u-link-list-item> -->
              </u-link-list>
            </u-linear-layout>
          </template>
          <template #noData>
            <template v-if="pagenation.selector">
              If no relevant content is found, you can adjust the keywords and search again.
            </template>
            <template v-else>
              There are no alert policy groups yet <u-link @click="toCreate">
                Create now
              </u-link>
              Just one
            </template>
          </template>
          <template #expand="{ data }">
            <div :class="$style.indent">
              <kube-table
                :items="data ? data.alerts : []"
                :columns="alertcolumns"
              >
                <template #[`item.metric.alertstate`]="{ item }">
                  <u-label :color="getAlertColor(item.metric.alertstate)">
                    {{ item.metric.alertstate }}
                  </u-label>
                </template>
                <template #[`item.labels`]="{ item }">
                  <span
                    v-for="label in toObjectArray(item.metric, 'key', 'value')"
                    :key="label.key"
                    class="u-chip"
                  >
                    {{ `${label.key}=${label.value}` }}
                  </span>
                </template>
              </kube-table>
            </div>
          </template>
          <template #error>
            Failed to obtain data, please<u-link @click="refresh">
              Try again
            </u-link>
          </template>
        </kube-table>
        <u-page
          v-if="data && calculatePages(data.total) > 1"
          :count="data.total"
          :page-size="pagenation.pageSize"
          :total="calculatePages(data.total)"
          @select="selectPage"
        />
      </template>
    </x-request>
  </u-linear-layout>
</template>

<script>
import { omit, get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import PageMixin from 'kubeworkz/mixins/pagenation';
import workloadService from 'kubeworkz/services/k8s-resource';
import clusterSelector from '../namespace/cluster-select.vue';
import monitorService from 'kubeworkz/services/monitor';
import {
    resolveTemplate,
} from 'kubeworkz/k8s-resources/monitor/utils.js';
import {
    toPlainObject as toPrometheusRulePlainObject,
    RESOURCE,
    CRITICALS,
} from 'kubeworkz/k8s-resources/prometheusRule/global';
const MONITOR_NAMESPACE = 'kubeworkz-monitoring';
const template = 'sum (ALERTS{cluster="$cluster",kubeworkz_io_owner=~"$tenant-$project.*"}) without(receive,tenant_id)';
const queryFunc = resolveTemplate(template);

export default {
    filters: {
        criticalFilter(val) {
            const t = CRITICALS.find(c => c.value === val);
            if (t) return t.text;
            return '-';
        },
    },
    components: {
        clusterSelector,
    },
    mixins: [ PageMixin ],
    beforeRouteLeave(to, from, next) {
        if (to.query.cluster) {
            next({
                path: to.path,
                query: omit(to.query, [ 'cluster' ]),
            });
        } else {
            next();
        }
    },
    metaInfo() {
        return {
            title: 'Alert rules - kubeworkz',
        };
    },
    data() {
        return {
            cluster: this.$route.query.cluster ? { value: this.$route.query.cluster, clusterName: this.$route.query.cluster } : null,
            columns: [
                { title: 'Alert name', name: 'metadata.name' },
                // { title: 'Alert rules', name: 'spec.rule.expr' },
                // { title: 'Alert policy group', name: 'spec.rule.ams' },
                // { title: 'Alert level', name: 'spec.rule.severity' },
                { title: 'Number of rules', name: 'regularnum', width: '100px' },
                { title: 'Creation time', name: 'metadata.creationTimestamp', width: '180px' },
                { title: 'Operation', name: 'operation', width: '100px' },
            ],
            alertcolumns: [
                { title: 'state', width: '180px', name: 'metric.alertstate' },
                { title: 'labels', name: 'labels', textwrap: true },
            ],
        };
    },
    computed: {
        tenant: get('scope/tenant@value'),
        project: get('scope/project@value'),
        service() {
            return () => Promise.all([
                workloadService.getNamespaceCRResource(this.params),
                monitorService.queryInstant({
                    params: {
                        query: queryFunc({
                            cluster: getFunc(this.cluster, 'clusterName'),
                            tenant: this.tenant,
                            project: this.project,
                        }),
                        time: Date.now() / 1000,
                    },
                }),
            ]);
            // return workloadService.getNamespaceCRResource;
        },
        params() {
            return {
                pathParams: {
                    cluster: getFunc(this.cluster, 'clusterName'),
                    namespace: MONITOR_NAMESPACE,
                    ...RESOURCE,
                },
                params: {
                    ...this.pagenation, // has to be this
                },
            };
        },
    },
    methods: {
        resolver(response) {
            const [ prometheusRuleResponse, statusResponse ] = response;
            const list = (prometheusRuleResponse.items || []).map(toPrometheusRulePlainObject).map(p => {
                const alerts = (getFunc(statusResponse, 'data.result') || []).filter(d => d.metric.alertname === p.metadata.name);
                return {
                    ...p,
                    alerts,
                };
            });
            return {
                list,
                total: prometheusRuleResponse.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        view() {

        },
        editItem(item) {
            this.$router.push({ path: `/platform/PrometheusRule/${getFunc(this.cluster, 'clusterName')}/${item.metadata.name}/edit` });
        },
        toCreate() {
            this.$router.push({ path: `/platform/PrometheusRule/${getFunc(this.cluster, 'clusterName')}/create` });
        },
        getRuleSum(item) {
            let num = 0;
            item.spec.groups.forEach(g => {
                num += g.rules.length;
            });
            return num;
        },
        deleteItem(item) {
            this.$confirm({
                title: 'Delete',
                content: `Confirm to delete ${item.metadata.name}?`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster.clusterName,
                            name: item.metadata.name,
                            ...RESOURCE,
                        },
                    };
                    await workloadService.deleteNamespaceCRResource(reqParam);
                    this.$refs.request.request();
                },
            });
        },
    },
};
</script>

<style module>
.indent{
    padding-left: 20px;
}
.label{
    margin-right: 1em;
    cursor: pointer;
}

</style>
