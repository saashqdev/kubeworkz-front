<template>
  <u-grid-layout-row
    v-if="chartOptions.length"
    :repeat="12"
    :class="$style.root"
  >
    <u-grid-layout-column
      v-for="(item, index) in chartOptions"
      :key="item.title"
      :span="4"
      style="margin-bottom: 20px;"
    >
      <u-monitor-chart-panel
        :ref="'chartPanel' + index"
        :class="$style.chart"
        height="320px"
        :content-style="item.contentStyle"
        type="ncs"
        :title="item.title"
        :unit="item.unit"
        :x-axis="xAxis"
        :y-axis="item.yAxis"
        :processor="item.processor"
        :metrics="item.metrics"
        :options="item.options"
      >
        <template
          slot="titleTemplate"
          slot-scope="scope"
        >
          <div
            v-if="!scope.modal"
            style="text-align: left;"
          >
            <span>{{ chartOptions[index].title }} </span>
            <div
              v-if="item.hasDevice"
              :class="$style.select"
            >
              <!-- Here options.device is the disk name in the corresponding interface request -->
              <u-select
                v-if="devices.length"
                key="listDevice"
                v-model="item.options.device"
                size="mini small"
                :data="devices"
                @select="onSelect($event, index, key = 'device')"
              />
              <u-select
                v-else
                key="noneDevice"
                size="mini small"
                :data="emptyDevices"
                disabled
              />
            </div>
            <div
              v-else-if="item.hasInterface"
              :class="$style.select"
            >
              <!-- Here options.interface is the network card name in the corresponding interface request -->
              <u-select
                v-if="interfaces.length"
                key="listInterface"
                v-model="item.options.interface"
                size="mini small"
                :data="interfaces"
                @select="onSelect($event, index, key = 'interface')"
              />
              <u-select
                v-else
                key="noneInterface"
                size="mini small"
                :data="emptyInterfaces"
                disabled
              />
            </div>
          </div>
          <!-- Display information related to the resource configuration of the workload -->
          <u-linear-layout
            v-if="item.extraInfos"
            style="text-align: center;margin-top: -10px;"
          >
            <span
              v-for="(item, index) in item.extraInfos"
              :key="index"
            >{{ item.key }}:<span>{{ item.value }}</span> {{ item.suffix }}</span>
          </u-linear-layout>
        </template>

        <template
          slot="headerTemplate"
          slot-scope="scope"
        >
          <u-monitor-optionbar
            v-bind="{timeRange:periodList, startTime, endTime, optionbarModules:['time'], noInterval: true}"
            @change="onModalChange($event, scope.change)"
          />
        </template>
      </u-monitor-chart-panel>
    </u-grid-layout-column>
  </u-grid-layout-row>
</template>

<style module>
.chart {
    margin: 0 10px;
}
.root {
    margin-left: -10px;
    margin-right: -10px;
}
.select[class] {
    display: inline-block;
    padding-left: 10px;
}
</style>

<script>
import Vue from 'vue';
import service from '@micro-app/common/services/ncs';
import { getStep, getQueryOptions, sizeProcessor } from './filters';
import { POD_CHART_OPTIONS } from './chartOptions';
// Deprecated: Functionality moved to @micro-app/ncs/components/global/u-monitors-ncs
export default {
    name: 'UMonitorsEnhance',
    props: {
        defaultChartOptions: { type: Array, default: () => POD_CHART_OPTIONS },
        queryOptionsList: { type: Array, default: () => ([]) }, // Request parameter list for multiple charts
        startTime: [ String, Number ],
        endTime: [ String, Number ],
        devices: { type: Array, default: () => ([]) }, // disk list
        interfaces: { type: Array, default: () => ([]) },
        // loading: { type: Boolean, default: false },
    },
    data() {
        return {
            chartOptions: [], // List of all chart parameters (all parameters of a chart)
            xAxis: { // x Axis displays related parameters
                key: 'timestr',
                count: 3,
            },
            currentDefaultChartOptions: this.defaultChartOptions,
            currentQueryOptionsList: this.queryOptionsList,
            // Disk selection related parameters on the monitoring chart
            // deviceName: '', // The deviceName selection of multiple monitoring charts is independent. This deviceName is used for initializing the monitoring chart.
            // devices: [],
            emptyDevices: [{ text: 'No disk yet' }],
            // Network card selection related parameters on the monitoring map
            // interfaceName: '',
            // interfaces: [],
            emptyInterfaces: [{ text: 'No network card yet' }],
            // Time selection space related data, all components are generally unified, if you need to customize it, props parameter transfer will be provided later.
            periodList: [
                { name: 'Last 6 hours', value: 360 * 60 * 1000 },
                { name: 'Last 1 day', value: 1440 * 60 * 1000 },
                { name: 'Last 7 days', value: 10080 * 60 * 1000 },
            ],
            loading: false, // todo: Not useful for now
        };
    },
    created() {
        this.$watch(() => [ this.startTime, this.endTime ], data => {
            if (!this.loading) {
                this.chartOptions.forEach((item, index) => Vue.set(item, 'options', getQueryOptions(Object.assign({ name: item.name, filter_label: item.keys ? 'type' : '' }, this.currentQueryOptionsList[index]), this.startTime, this.endTime)));
                this.$nextTick(() => this.$refresh());
            }
        });
    },
    methods: {
        // After obtaining the external parameters [mainly asynchronous], manually call this function to perform the initialization operation.
        init() {
            this.loading = false;
            this.watchDevices();
            this.chartOptions = this.currentDefaultChartOptions.map((item, index) => this.getChartOptions(this.currentDefaultChartOptions[index], this.currentQueryOptionsList[index]));
            this.$nextTick(() => this.$refresh());
        },
        // When devices are updated, device in each chart is updated synchronously to be the first item in the list.
        watchDevices() {
            if (this.devices.length) {
                this.currentDefaultChartOptions.forEach(item => item.hasDevice && (item.key = this.devices[0].value));
                this.currentQueryOptionsList.forEach((item, index) => this.currentDefaultChartOptions[index].hasDevice && (item.device = this.devices[0].value));
            } else {
                // Out of syc - currentDefaultChartOptions && currentQueryOptionsList
                this.chartOptions.forEach(item => {
                    Vue.set(item.options, 'device', undefined);
                });
            }
        },
        formatTime(time) {
            return Math.floor(time / 1000);
        },
        onModalChange(event, next) {
            const { startTime, endTime } = event;
            const step = getStep(startTime, endTime);
            !this.loading && next({ start: this.formatTime(startTime), end: this.formatTime(endTime), step });
        },
        onSelect(event, index, key = 'device') {
            // Synchronize - currentDefaultChartOptions && currentQueryOptionsList
            this.currentDefaultChartOptions[index].key = event.value;
            this.currentQueryOptionsList[index].device = event.value;
            // Update chartOptions
            Vue.set(this.chartOptions, index, this.getChartOptions(this.currentDefaultChartOptions[index], this.currentQueryOptionsList[index]));
            // Refresh the corresponding chart
            this.$nextTick(() => {
                this.$refs[`chartPanel${index}`] && this.$refs[`chartPanel${index}`][0].refresh();
            });
        },
        /**
         * Let all charts || refresh a specific chart and expose it to the outside
         * @param {number} index - The index of the chart (if it is not passed or the value passed is illegal, it will be considered to refresh all)
         */
        $refresh(index) {
            index = parseInt(index);
            const length = this.chartOptions.length;
            const refreshAll = !(!isNaN(index) && index < length && index >= 0);
            this.chartOptions.forEach((item, i) => {
                if (!refreshAll && index !== i) { return; }

                const chart = this.$refs[`chartPanel${i}`];

                if (chart && chart.length) {
                    // Monitoring charts corresponding to devices or interfaces. If there is no corresponding device or interface, an empty state will be displayed directly.
                    if ((item.hasDevice && !item.options.device) || (item.hasInterface && !item.options.interface)) { chart[0].refresh([]); } else { chart[0].refresh(); }
                }
            });
        },
        /**
         * Get options for a single chart
         * @param {object} options - Chart (rendering) related parameters
         * @param {object} queryOptions - Parameters required for chart-related requests [do not pass step, start, end, name]
         * @return {object}
         */
        getChartOptions(options, queryOptions) {
            const yAxis = { min: 0, name: '', count: 3 };
            // Monitoring icon in %, set y-axis max to 100, count to 5
            options.unit === '%' && Object.assign(yAxis, { max: 100, count: 5 });
            options = Object.assign({
                yAxis,
                // If options specify a processor, it will directly override the default one.
                // Add a default sizeProcessor to charts whose unit starts with B (B, B/s, etc.)
                processor: options.unit && options.unit.startsWith('B') ? sizeProcessor : undefined,
            }, options);
            // Each item [key] of keys is an object with attributes value and text. If each item is a string, value === text
            // The key attribute is a string (that is, specify the corresponding value attribute), and the text defaults to options.title
            const metrics = options.keys
                ? options.keys.map(item => (typeof item === 'string' ? { name: item, key: item } : { name: item.text, key: item.value }))
                : [{ name: options.title, key: options.key }];
            return {
                options: getQueryOptions(Object.assign({
                    name: options.name,
                    filter_label: options.keys ? 'type' : '',
                }, queryOptions), this.startTime, this.endTime),
                // Monitor dimension information (corresponding to each piece of data)
                metrics,
                ...options,
            };
        },
    },
};
</script>

