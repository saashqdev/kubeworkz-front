<template>
  <div>
    <div class="kube-float-layout">
      <div
        v-for="({key, title}) in keys"
        :key="key"
        :class="$style.inputblock"
      >
        <u-text>{{ title }}:  </u-text>
        <u-input
          :value="searchbody[key]"
          @change="debounceonChange($event.value, key)"
        />
      </div>
      <div :class="$style.inputblock">
        <u-text :class="$style.required">
          Request time:
        </u-text>

        <u-date-picker
          time="start"
          :date="searchbody.startTime"
          :max-date="searchbody.endTime"
          @select="startTimeSelect"
        />
        <span :class="$style.spliter"> to </span>
        <u-date-picker
          time="end"
          :date="searchbody.endTime"
          :min-date="searchbody.startTime"
          @select="endTimeSelect"
        />
      </div>
      <div :class="$style.inputblock">
        <u-button @click="exportAudit">
          Export
        </u-button>
      </div>
    </div>
    <x-request
      ref="request"
      :service="service"
      :params="{
        params: {
          ...searchbody,
          startTime: searchbody.startTime,
          endTime: searchbody.endTime,
          page: pagination.pageNum,
          size: pagination.pageSize,
          sortBy: pagination.sortName,
          sortAsc: pagination.sortOrder === 'asc'
        }
      }"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading, error }">
        <kube-table
          table-width="100%"
          :loading="loading"
          :columns="columns"
          :items="data ? data.list : []"
          :error="error"
          :resizable="true"
          @sort="onSort"
        >
          <template #[`item.EventTime`]="{ item }">
            {{ item.EventTime * 1000 | formatLocaleTime }}
          </template>
          <template #[`item.ResponseStatus`]="{ item }">
            <u-label :color="responseCodeColorsMap(item.ResponseStatus)">
              {{ item.ResponseStatus }}
            </u-label>
          </template>
          <template #noData>
            No audit information yet
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
  </div>
</template>

<script>
import { debounce } from 'lodash';
import auditService from 'kubeworkz/services/audit';
import PageMixin from 'kubeworkz/mixins/pagination';
export default {
    metaInfo: {
        title: 'Operational audit - kubeworkz',
    },
    mixins: [ PageMixin ],
    data() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const timestamp = startOfDay.getTime();
        return {
            service: auditService.getAudit,
            keys: [{
                title: 'Account',
                key: 'userName',
            }, {
                title: 'IP address',
                key: 'sourceIpAddress',
            }, {
                title: 'Resource name',
                key: 'resourceName',
            }, {
                title: 'Event name',
                key: 'eventName',
            }, {
                title: 'Response status',
                key: 'responseStatus',
            }],
            searchbody: {
                startTime: (timestamp - 24 * 60 * 60 * 1000),
                endTime: timestamp,
                userName: '',
                eventName: '',
                // page,
                resourceName: '',
                responseStatus: '',
                sourceIpAddress: '',
                // size,

            },
            columns: [
                { title: 'Account', name: 'UserIdentity.AccountId' },
                { title: 'Time', name: 'EventTime', sortable: true },
                { title: 'IP address', name: 'SourceIpAddress' },
                { title: 'Event name', name: 'EventName', textwrap: true },
                { title: 'Resource', name: 'ResourceReports', textwrap: true },
                { title: 'Status', name: 'ResponseStatus' },
            ],
            debounceonChange: debounce(this.onChange, 300),
        };
    },
    methods: {
        onChange(val, key) {
            this.searchbody[key] = val;
        },
        resolver(response) {
            console.log(response);
            return {
                list: (response.Events || []).map(event => ({
                    ...event,
                    ResourceReports: (event.ResourceReports || []).map(({ ResourceType, ResourceName, ResourceId }) => `Resource Type:${ResourceType}, Resource Name:${ResourceName}, Resource ID:${ResourceId}`).join(','),
                })),
                total: response.Total,
            };
        },
        startTimeSelect({ date }) {
            this.searchbody.startTime = date.getTime();
        },
        endTimeSelect({ date }) {
            this.searchbody.endTime = date.getTime();
        },
        onSort({ order, name }) {
            this.pagination.sortOrder = order;
            this.pagination.sortName = `${name}`;
        },
        async exportAudit() {
            const response = await auditService.exportAudit({
                params: {
                    ...this.searchbody,
                    startTime: this.searchbody.startTime / 1000,
                    endTime: this.searchbody.endTime / 1000,
                },
            });
            const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'audit.csv';
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); // aft
        },
        responseCodeColorsMap(code) {
            code = code + '';
            if (/^2/.test(code)) {
                return 'success';
            } else if (/^3/.test(code)) {
                return 'primary';
            } else if (/^4/.test(code)) {
                return 'warning';
            } else if (/^5/.test(code)) {
                return 'error';
            }
            return 'default';
        },
    },
};
</script>

<style module>
.inputblock{
    display: inline-block;
    margin: 5px 15px;
}
.inputblock > span:first-child{
    display:inline-block;
    width: 5em;
}
.spliter{
    display: inline-block;
    text-align: center;
    width: 2em;
}
.timer{
    width: 10em;
}
.required:after {
    content: '*';
    color: red;
}

</style>
