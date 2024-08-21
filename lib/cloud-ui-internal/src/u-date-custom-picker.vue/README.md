# Custom time selection control

## Example
### Basic form

``` html
<u-date-custom-picker></u-date-custom-picker>
```

### no interval

``` html
<u-date-custom-picker :noInterval="true"></u-date-custom-picker>
```

### Time selection interval setting

``` html
<u-date-custom-picker :limitDays="100"></u-date-custom-picker>
```
### Time customization

``` vue
<template>
    <u-date-custom-picker :time-range="timeRange"></u-date-custom-picker>
</template>
<script>
export default {
    data() {
        return {
            timeRange: [
                { name: 'Last 6 hours', value: 360 * 60 * 1000 },
                { name: 'Last 1 day', value: 1440 * 60 * 1000 },
                { name: 'last 7 days', value: 10080 * 60 * 1000 },
            ],
        };
    },
};
</script>
```
### Custom time interval

``` vue
<template>
    <u-date-custom-picker :time-range="timeRange" :init-period-options-method="initPeriodOptionsMethod"></u-date-custom-picker>
</template>

<script>
const NOS_PERIOD_OPTIONS = [
    { value: 60 * 60, name: '1 hour' },
    { value: 60 * 60 * 24, name: '1 day' },
];
export default {
    data() {
        return {
            timeRange: [
                { name: 'Last 6 hours', value: 360 * 60 * 1000 },
                { name: 'Last 1 day', value: 1440 * 60 * 1000 },
                { name: 'last 7 days', value: 10080 * 60 * 1000 },
            ],
        };
    },
    methods: {
        initPeriodOptionsMethod: (interval, ONE_MINUTE, sender) => {
            let periodOptions = NOS_PERIOD_OPTIONS;
            if (interval < ONE_MINUTE * 60 * 24 * 2)
                periodOptions = NOS_PERIOD_OPTIONS.slice(0, 1);
            else if (interval > ONE_MINUTE * 60 * 24 * 12)
                periodOptions = NOS_PERIOD_OPTIONS.slice(1, 2);
            return periodOptions;
        },
    },
};
</script>
```
### Set initial date value

``` vue
<template>
    <u-date-custom-picker :date="date"></u-date-custom-picker>
</template>

<script>
export default {
    data() {
        return {
            // Note that this value cannot be synchronized, and all values   must be manually bound to events.
            date: {
                startTime: new Date('2018-08-20').getTime() - 24 * 60 * 60 * 1000,
                endTime: new Date('2018-08-20').getTime(),
                period: 24 * 60 * 60 * 1000,
                interval: 60 * 60,
            },
        };
    },
};
</script>
```

## DateCustomPicker API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| timeRange | Array | Object | Time selection interval |
| noInterval | Boolean | `false`| No interval selection |
| datewidth | Number | `80` | Date selection box width |
| limitDays | Number | `59` | Limit selection date range |
| maxDate | Number | Current time | Set maximum value |
| date | Object |  | Set initial date value |

<!-- ### Slots

#### (default) -->

### Events

#### @update

Triggered when value changes

| Param | Type | Description |
| ----- | ---- | ----------- |
| $event | Object | Changed date information |
