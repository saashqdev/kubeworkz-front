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
              <u-select
                v-if="devices.length"
                :key="listDisk"
                v-model="item.deviceName"
                size="mini small"
                :data="devices"
                @select="onSelect($event, index, key = 'deviceName')"
              />
              <u-select
                v-else
                :key="noneDisk"
                size="mini small"
                :data="emptyDevices"
                disabled
              />
            </div>
            <div
              v-else-if="item.hasInterface"
              :class="$style.select"
            >
              <u-select
                v-if="interfaces.length"
                :key="listInterface"
                v-model="item.interfaceName"
                size="mini small"
                :data="interfaces"
                @select="onSelect($event, index, key = 'interfaceName')"
              />
              <u-select
                v-else
                :key="noneInterface"
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
import service from '@micro-app/common/services/ncs';
import { getStep } from './filters';
import { POD_CHART_OPTIONS } from './chartOptions';
// Deprecated: Function moved to @micro-app/ncs/components/global/u-monitors-ncs
export default {
    name: 'UMonitors',
    props: {
        defaultChartOptions: { type: Array, default: () => POD_CHART_OPTIONS },
        // All are required parameters
        clusterName: String,
        nsName: String,
        podName: String,
        containerName: String,

        startTime: [ String, Number ],
        endTime: [ String, Number ],
    },
    data() {
        return {
            chartOptions: [], // List of all chart parameters (all parameters of a chart)
            xAxis: { // x Axis displays related parameters
                key: 'timestr',
                count: 3,
            },
            // Disk selection related parameters on the monitoring chart
            deviceName: '', // The deviceName selection of multiple monitoring charts is independent. This deviceName is used for initializing the monitoring chart.
            devices: [],
            emptyDevices: [{ text: 'No disk yet' }],
            // Network card selection related parameters on the monitoring map
            interfaceName: '',
            interfaces: [],
            emptyInterfaces: [{ text: 'No network card yet' }],
            // Time selection namespace related data, all components are generally unified, if you need to customize it, props parameter transfer will be provided later.
            periodList: [
                { name: 'Last 6 hours', value: 360 * 60 * 1000 },
                { name: 'Last 1 day', value: 1440 * 60 * 1000 },
                { name: 'Last 7 days', value: 10080 * 60 * 1000 },
            ],
            loading: false,
        };
    },
    created() {
        // The following situation is when four parameters are passed into the component at the same time
        if (this.clusterName && this.nsName && this.podName && this.containerName) { this.loadInfo(); }

        // The following watch is for the situation where these four parameters cannot be passed into the component at the same time.
        this.$watch(() => [ this.clusterName, this.nsName, this.podName, this.containerName ], data => {
            // Only when all four parameters exist
            if (data.every(item => item)) { this.loadInfo(); }
        });
        this.$watch(() => [ this.startTime, this.endTime ], data => {
            if (!this.loading) {
                this.chartOptions = this.getChartOptions(this.chartOptions);
                this.$forceUpdate();
                this.$nextTick(() => this.$refresh());
            }
        });
    },
    methods: {
        formatTime(time) {
            return Math.floor(time / 1000);
        },
        onModalChange(event, next) {
            const { startTime, endTime } = event;
            const step = getStep(startTime, endTime);
            !this.loading && next({ start: this.formatTime(startTime), end: this.formatTime(endTime), step });
        },
        onSelect(event, index, key = 'deviceName') {
            const options = this.chartOptions[index];
            options[key] = event.value;
            this.chartOptions[index] = this.getChartOptions(options);
            this.$forceUpdate();
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
                    // Monitoring charts corresponding to devices or interfaces. If there is no corresponding deviceName or interfaceName, an empty state will be displayed directly.
                    if ((item.hasDevice && !item.deviceName) || (item.hasInterface && !item.interfaceName)) { chart[0].refresh([]); } else { chart[0].refresh(); }
                }
            });
        },
        loadInfo() {
            this.loading = true;
            Promise.all([
                service.loadAllInfo({
                    name: 'disk_info',
                    dimension: 'container',
                    cluster: this.clusterName,
                    namespace: this.nsName,
                    pod_name: this.podName,
                    container_name: this.containerName,
                }),
                service.loadAllInfo({
                    name: 'network_info',
                    dimension: 'pod',
                    cluster: this.clusterName,
                    namespace: this.nsName,
                    pod_name: this.podName,
                }),
            ]).then(result => {
                this.devices = (result[0] || []).map(item => ({
                    text: item.metric.device,
                    value: item.metric.device,
                }));
                this.interfaces = (result[1] || []).map(item => ({
                    text: item.metric.interface,
                    value: item.metric.interface,
                }));
                this.devices.length && (this.deviceName = this.devices[0].value);
                this.interfaces.length && (this.interfaceName = this.interfaces[0].value);
                this.loading = false;
                this.chartOptions = this.getChartOptions(this.defaultChartOptions);
                this.$nextTick(() => this.$refresh());
            });
        },
        getChartOptions(options) {
            const isArray = Array.isArray(options);
            options = isArray ? options : [ options ];
            const tmp = options.map((item, index) => {
                const extraOption = {};
                let metricKey = '';
                const deviceName = item.deviceName || this.deviceName;
                const interfaceName = item.interfaceName || this.interfaceName;

                if (item.hasDevice) {
                    extraOption.container_name = this.containerName;
                    extraOption.device = deviceName;
                    metricKey = deviceName;
                } else if (item.hasInterface) {
                    extraOption.interface = interfaceName;
                    metricKey = interfaceName;
                } else {
                    extraOption.container_name = this.containerName;
                    metricKey = this.containerName;
                }

                return {
                    options: Object.assign({
                        step: getStep(this.startTime, this.endTime),
                        // Fixed for 30 minutes
                        start: this.formatTime(this.startTime),
                        end: this.formatTime(this.endTime),
                        name: item.name, // Monitoring items
                        dimension: item.hasInterface ? 'pod' : 'container', // Dimensions
                        cluster: this.clusterName,
                        namespace: this.nsName,
                        pod_name: this.podName,
                    }, extraOption, item.options),
                    // Monitor dimension information (corresponding to each piece of data)
                    metrics: item.keys || [{
                        name: item.title,
                        key: metricKey,
                    }],
                    processor: item.processor,
                    unit: item.unit,
                    title: item.title,
                    name: item.name, // Monitoring items
                    hasDevice: item.hasDevice,
                    deviceName,
                    hasInterface: item.hasInterface,
                    interfaceName,
                    extraInfos: item.extraInfos,
                    contentStyle: item.extraInfos ? { top: '95px' } : {},
                    yAxis: {
                        min: 0,
                        name: '',
                        count: 2,
                    },
                };
            });
            return isArray ? tmp : tmp[0];
        },
    },
};
</script>
