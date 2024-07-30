# Chart selection bar

## Example
### Basic form

``` vue
<template>
    <u-monitor-optionbar :optionbar-modules="['time', 'statistics']" @change="change($event)"></u-monitor-optionbar>
</template>
<script>
export default {
    methods: {
        change($event) {
            // $event: {startTime: Start time, endTime: 'End Time', interval: 'Time interval', type: 'Type', statistics: 'Data value'}
        },
    },
};
</script>
```

### Prefix type selection

``` vue
<template>
    <u-monitor-optionbar type-name="node" :type-options="typeOptions" :optionbar-modules="['type', 'time', 'statistics']" @change="change($event)"></u-monitor-optionbar>
</template>
<script>
export default {
    data() {
        return {
            typeOptions: [{
                name: 'node-1',
                value: 'node-1',
            }, {
                name: 'node-2',
                value: 'node-2',
            }],
        };
    },
    methods: {
        change($event) {
            // $event: {startTime: 'Start time', endTime: 'End time', interval: 'Time interval', type: 'Type', statistics: 'Data value'}
        },
    },
};
</script>
```

### Custom date interval and initialization date

``` vue
<template>
    <u-monitor-optionbar type-name="node" :type-options="typeOptions" :optionbar-modules="['type', 'time', 'statistics']" :end-time="new Date().getTime()" :start-time="new Date().getTime()-timeRange[2].value" :time-range="timeRange" @change="change($event)"></u-monitor-optionbar>
</template>
<script>
export default {
    data() {
        return {
            typeOptions: [{
                name: 'node-1',
                value: 'node-1',
            }, {
                name: 'node-2',
                value: 'node-2',
            }],
            timeRange: [
                { value: 3 * 60 * 60 * 1000, name: 'nearly 3 hours' },
                { value: 12 * 60 * 60 * 1000, name: 'last 12 hours' },
                { value: 7 * 24 * 60 * 60 * 1000, name: 'last 7 days' },
            ],
        };
    },
    methods: {
        change($event) {
            // $event: {startTime: 'Start time', endTime: 'End time', interval: 'Time interval', type: 'Type', statistics: 'Data value'}
        },
    },
};
</script>
```

### Customize the data acquisition time interval

``` vue
<template>
    <u-monitor-optionbar type-name="node" :type-options="typeOptions" :optionbar-modules="['type', 'time', 'statistics']" :end-time="new Date().getTime()" :start-time="new Date().getTime()-timeRange[2].value" :init-period-options-method="initPeriodOptionsMethod" :time-range="timeRange" @change="change($event)"></u-monitor-optionbar>
</template>
<script>
const NOS_PERIOD_OPTIONS = [
    { value: 60 * 60, name: '1 hour' },
    { value: 60 * 60 * 24, name: '1 day' },
];
export default {
    data() {
        return {
            typeOptions: [{
                name: 'node-1',
                value: 'node-1',
            }, {
                name: 'node-2',
                value: 'node-2',
            }],
            initPeriodOptionsMethod: (interval, ONE_MINUTE, sender) => {
                let periodOptions = NOS_PERIOD_OPTIONS;
                if (interval < ONE_MINUTE * 60 * 24 * 3)
                    periodOptions = NOS_PERIOD_OPTIONS.slice(0, 1);
                else if (interval > ONE_MINUTE * 60 * 24 * 12)
                    periodOptions = NOS_PERIOD_OPTIONS.slice(1, 2);
                return periodOptions;
            },
            timeRange: [
                { value: 3 * 60 * 60 * 1000, name: 'nearly 3 hours' },
                { value: 12 * 60 * 60 * 1000, name: 'last 12 hours' },
                { value: 7 * 24 * 60 * 60 * 1000, name: 'last 7 days' },
            ],
        };
    },
    methods: {
        change($event) {
            // $event: {startTime: 'Start time', endTime: 'End time', interval: 'Time interval', type: 'Type', statistics: 'Data value'}
        },
    },
};
</script>
```


### Custom prefix slot and suffix slot

``` vue
<template>
    <u-monitor-optionbar :optionbar-modules="['time']" :end-time="new Date().getTime()" :start-time="new Date().getTime()-timeRange[2].value" :init-period-options-method="initPeriodOptionsMethod" :time-range="timeRange" @change="change($event)">
        <div slot="pre" :class="$style.item">
            <label>Prefix type:</label>
            <!-- It is recommended here to directly store the value in the current component and assemble it into the options of the chart in the change listener. -->
            <u-select v-model="node" :data="typeOptions">
            </u-select>
        </div>
        <div slot="after" :class="$style.item">
            <label>Suffix types:</label>
            <!-- It is recommended here to directly store the value in the current component and assemble it into the options of the chart in the change listener. -->
            <u-select v-model="afterNode" :data="typeOptions">
            </u-select>
        </div>
    </u-monitor-optionbar>
</template>
<style module>
.item{
    display: inline-block;
    margin-right: 20px;
    margin-top:5px;
}
</style>
<script>
const NOS_PERIOD_OPTIONS = [
    { value: 60 * 60, name: '1 hour' },
    { value: 60 * 60 * 24, name: '1 day' },
];
export default {
    data() {
        return {
            node: '',
            afterNode: '',
            typeOptions: [{
                text: 'node-1',
                value: 'node-1',
            }, {
                text: 'node-2',
                value: 'node-2',
            }],
            initPeriodOptionsMethod: (interval, ONE_MINUTE, sender) => {
                let periodOptions = NOS_PERIOD_OPTIONS;
                if (interval < ONE_MINUTE * 60 * 24 * 3)
                    periodOptions = NOS_PERIOD_OPTIONS.slice(0, 1);
                else if (interval > ONE_MINUTE * 60 * 24 * 12)
                    periodOptions = NOS_PERIOD_OPTIONS.slice(1, 2);
                return periodOptions;
            },
            timeRange: [
                { value: 3 * 60 * 60 * 1000, name: 'nearly 3 hours' },
                { value: 12 * 60 * 60 * 1000, name: 'last 12 hours' },
                { value: 7 * 24 * 60 * 60 * 1000, name: 'last 7 days' },
            ],
        };
    },
    methods: {
        change($event) {
            // $event: {startTime: 'Start time', endTime: 'End time', interval: 'Time interval', type: 'Type', statistics: 'Data value'}
        },
    },
};
</script>
```

## MonitorOptionbar API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| optionbarModules | Array | `['type', 'time', 'statistics']` | Default components that need to be included |
| endTime | Date | `new Date().getTime` | End time |
| startTime | Date | `endTime-range[0].value` | Start time |
| timeRange | Array |  | Date interval time selection array |
| initPeriodOptionsMethod | Function |  | Data point interval value |
| typeName | '' | `''` | Type name, only takes effect when the type item exists |
| typeOptions | Array | `[]` | Type selection array, only effective when the type item exists |


### Events

#### @change

Triggered when value changes

| Param | Type | Description |
| ----- | ---- | ----------- |
| $event.endTime | Number | End time |
| $event.startTime | Number | Start time |
| $event.interval | Number | Start time and end time interval |
| $event.type | value | Choose a type |
| $event.statistics | Number | Data point interval (synchronized to the chart is the distance between adjacent points on the x-axis) |

## FormTableTr API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| rules | Array | `[]` | input validation rules |
| disabled | Boolean | `false` | Whether to disable dynamic delete button |


### Events

#### @remove
Trigger removal event