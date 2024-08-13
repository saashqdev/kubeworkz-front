<template>
  <x-request
    ref="request"
    :service="eventService"
    :params="requestParam"
    :processor="resolver"
  >
    <template slot-scope="{ data, loading, error }">
      <kube-table
        table-width="100%"
        :columns="columns"
        :loading="loading"
        :error="error"
        :items="(data? data.list : [])"
      >
        <template #[`item.firstTimestamp`]="{ item }">
          {{ item.firstTimestamp | formatLocaleTime }}
        </template>
        <template #[`item.lastTimestamp`]="{ item }">
          {{ item.lastTimestamp | formatLocaleTime }}
        </template>
        <template #noData>
          No data
        </template>
      </kube-table>
      <u-page
        v-if="data && calculatePages(data.total) > 0"
        :count="data.total"
        :page-size="pagination.pageSize"
        :total="calculatePages(data.total)"
        @select="selectPage"
      />
    </template>
  </x-request>
</template>

<script>
import { pickBy } from 'lodash';
import workloadService from 'kubeworkz/services/k8s-resource';
import PageMixin from 'kubeworkz/mixins/pagination';
import {
    toPlainObject as toEventPlainObject,
} from 'kubeworkz/k8s-resources/event/index.js';

export default {
    metaInfo: {
        title: 'kubeworkz',
        titleTemplate: '%s - Event',
    },
    mixins: [ PageMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            eventService: workloadService.getResourceListWithoutNamespace,
            columns: [
                { title: 'Message', name: 'message', textwrap: true },
                { title: 'Reason', name: 'reason', width: '120px' },
                { title: 'Event object fieldPath', name: 'involvedObject.fieldPath', width: '160px' },
                { title: 'First appearance time', name: 'firstTimestamp', width: '160px' },
                { title: 'Last seen time', name: 'lastTimestamp', width: '160px' },
                { title: 'Count', name: 'count', width: '50px' },
            ],
            kind: 'Node',
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
                    resource: 'events',
                },
                params: {
                    ...pickBy(this.pagination, i => !!i), // has to be this
                    fieldSelector: `involvedObject.kind=Node,involvedObject.name=${this.$route.params.nodename}`,
                },
            };
        },

    },

    methods: {
        resolver(response) {
            return {
                list: (response.items || []).map(toEventPlainObject),
                total: response.total,
            };
        },
    },
};
</script>

<style>

</style>
