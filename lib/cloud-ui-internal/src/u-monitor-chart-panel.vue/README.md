# Chart

## Example
### Basic form

``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor">
</u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: 'Data disk read and write latency',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: 'Data disk read delay' },
                    { key: 'num', name: 'Data disk write delay' },
                ],
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2023-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2023-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2023-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2023-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2023-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2023-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2023-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```
### No pop-ups
``` vue
<template>
<u-monitor-chart-panel :no-model="true" style="margin-top:20px;" ref="chartPanel" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: 'Data disk read and write latency',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: 'Data disk read delay' },
                    { key: 'num', name: 'Data disk write delay' },
                ],
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2023-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2023-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2023-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2023-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2023-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2023-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2023-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```
### No refresh
``` vue
<template>
<u-monitor-chart-panel :no-refresh="true" style="margin-top:20px;" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: 'Data disk read and write latency',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: 'Data disk read delay' },
                    { key: 'num', name: 'Data disk write delay' },
                ],
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2023-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2023-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2023-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2023-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2023-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2023-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2023-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```
### Refresh event
``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" ref="chartPanel" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" @refresh="onRefresh" :preprocessor="metric.preprocessor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: 'Data disk read and write latency',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: 'Data disk read delay' },
                    { key: 'num', name: 'Data disk write delay' },
                ],
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2023-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2023-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2023-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2023-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2023-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2023-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2023-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
    methods: {
        onRefresh(event) {
            console.log(event);
        },
    },
};
</script>
```

### Custom data spacing
``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" :x-axis="metric.xAxis" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :y-axis="metric.yAxis" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: 'Data disk read and write latency',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: 'Data disk read delay' },
                    { key: 'num', name: 'Data disk write delay' },
                ],
                xAxis: {
                    key: 'timestr',
                    count: 4,
                },
                yAxis: {
                    min: 0,
                    name: '',
                    count: 6,
                },
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2023-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2023-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2023-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2023-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2023-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2023-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2023-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```

### 数据后处理
``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :x-axis="metric.xAxis" :y-axis="metric.yAxis" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor" :processor="metric.processor"></u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        const self = this;
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: 'Data disk read and write latency',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: 'Data disk read delay' },
                    { key: 'num', name: 'Data disk write delay' },
                ],
                xAxis: {
                    key: 'timestr',
                    count: 4,
                },
                yAxis: {
                    min: 0,
                    name: '',
                    count: 6,
                },
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2023-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2023-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2023-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2023-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2023-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2023-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2023-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
                processor(result, modal) {
                    self.metric.unit = 's';
                    return result;
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
```
### Add chart information
``` vue
<template>
<u-monitor-chart-panel style="margin-top:20px;" :optionbar-options="{startTime: options.startTime, endTime: options.endTime,optionbarModules:['time'], noInterval: true}" :x-axis="metric.xAxis" :y-axis="metric.yAxis" ref="chartPanel" :options="options" :key="metric.title" :metrics="metric.metrics" :title="metric.title" :unit="metric.unit" :preprocessor="metric.preprocessor" :processor="metric.processor" :content-style ="{top:'115px'}">
    <template slot="titleTemplate" slot-scope="scope">
        <div>
            <span>{{ metric.title }} </span>
        </div>
        <div :class="$style.line">
            <span :class="$style.text" style="width: 50%;">10 times in total</span>
            <span :class="$style.text" style="width: 50%;">Frequency 10 times/min</span>
        </div>
    </template>
</u-monitor-chart-panel>
</template>
<script>
export default {
    data() {
        const endTime = new Date().getTime();
        const self = this;
        return {
            options: {
                startTime: endTime - 60 * 60 * 1000,
                endTime,
            },
            metric: {
                title: 'Data disk read and write latency',
                unit: 'ms/op',
                metrics: [
                    { key: 'number', name: 'Data disk read delay' },
                    { key: 'num', name: 'Data disk write delay' },
                ],
                xAxis: {
                    key: 'timestr',
                    count: 4,
                },
                yAxis: {
                    min: 0,
                    name: '',
                    count: 6,
                },
                preprocessor(options, chart) {
                    return Promise.resolve([
                        { timestamp: new Date('2023-08-09').getTime(), number: 150, num: 1200 },
                        { timestamp: new Date('2023-08-10').getTime(), number: 300, num: 1200 },
                        { timestamp: new Date('2023-08-11').getTime(), number: 28, num: 1000 },
                        { timestamp: new Date('2023-08-12').getTime(), number: 200, num: 2000 },
                        { timestamp: new Date('2023-08-13').getTime(), number: 74, num: 740 },
                        { timestamp: new Date('2023-08-14').getTime(), number: 532, num: 2000 },
                        { timestamp: new Date('2023-08-15').getTime(), number: 420, num: 5000 },
                    ]);
                },
                processor(result, modal) {
                    self.metric.unit = 's';
                    return result;
                },
            },
        };
    },
    mounted() {
        this.$refs.chartPanel.refresh();
    },
};
</script>
<style module>
.line{
    width: 70%;
    margin: auto;
    font-size: 14px;
}
.text {
    white-space: nowrap;
    display: inline-block;
    text-align: center;
    font-size: 18px;
    width: 33.2%;
}
</style>
```
# API
### Props/Attrs

| Prop/Attr | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| dimensions | Array |  | Dimension information, chart request source data are transparently transmitted to chart request processing |
| filters | Object |  | Dimension information, chart request source data are transparently transmitted to chart request processing |
| options | Object |  | Dimension information, chart request source data are transparently transmitted to chart request processing |
| metrics | Object |  | Dimension information, chart request source data are transparently transmitted to chart request processing |
| optionbarOptions | Object |  | Pop-up window condition input field parameters |
| modalConfig | Object |  | Chart pop-up window parameter transfer |
| unit | String |  | Data unit |
| title | String |  | Chart title |
| titleAlign | String | 'left' | The alignment of the chart title, the default is centered, the values ​​are: left, center, right |
| contentStyle | Object | | Chart content style |
| xAxis | Object | { key: 'timestr', count: 6, }| Chart x-axis data display method |
| yAxis | Object | { min: 0,name: '',count: 6, }| Chart y-axis data display method |
| preprocessor | Function |  | Chart request data pre-processing |
| processor | Function |  | Chart request data post-processing |
| noModel | Boolean |  | Hide pop-up window |
| noRefresh | Boolean |  | Hide refresh |
| noModalHeader | Boolean |  | Hide pop-up header |
| templateData | Object |  | Chart template data injection |
| modalTemplateData | Object |  | Chart pop-up template data injection |

## Slots

| Slot  | Description |
| --------- | ---- |
| titleTemplate | Custom title content |
| captionTemplate | Customize caption content |