# DatePicker

## Example
### Basic form

``` html
<u-linear-layout>
    <u-date-picker></u-date-picker>
    <u-date-picker date="2024-08-08"></u-date-picker>
</u-linear-layout>
```
### auto focus

``` html
<u-date-picker date="2024-08-08" autofocus></u-date-picker>
```

### Pop-up window method

``` html
<u-linear-layout>
    <u-date-picker placeholder="left" alignment="left"></u-date-picker>
    <u-date-picker placeholder="right" alignment="right"></u-date-picker>
</u-linear-layout>

```

### Maximum and minimum values
``` html
<u-date-picker date="2024-08-08" min-date="2024-08-06" max-date="2024-08-18"></u-date-picker>
```

### Read only and disabled
``` html
<u-linear-layout>
    <u-date-picker readonly date="2024-08-08"></u-date-picker>
    <u-date-picker disabled date="2024-08-08"></u-date-picker>
</u-linear-layout>

```

### Method
``` vue
<template>
    <u-date-picker time="morning" year-diff="1" year-add="5" :date.sync="date" @change="change" @select="select" @toggle="toggle($event)">Modal</u-date-picker>
</template>

<script>
export default {
    data() {
        return {
            date: '2024-08-01',
        };
    },
    methods: {
        change(newVal) {
            // console.log(newVal);
        },
        select(newVal) {
            // console.log(newVal);
        },
        toggle(event) {
            // console.log(event);
        },
    },
    watch: {
        date(newValue) {
            // console.log(newVal);
        },
    },
};
</script>
```
## DatePicker API
### Attrs/Props

| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| width | String, Number | `160` | input box width |
| date.sync | String,Number,Date | | initial date value |
| minDate | String,Number,Date | | minimum date |
| maxDate | String,Number,Date | | maximum date |
| readonly | Boolean | `false` | read-only |
| disabled | Boolean | `false` | disabled |
| autofocus | Boolean | `false` | text box is in focus by default |
| placeholder | String | `please enter` | text box default prompt |
| alignment | String | `left` | Calendar pop-up window alignment method, optional values:`left`, `right` |
| time | String, Number | `start` | Set the hour, minute and second value of the returned date. The optional value is `start`, indicates hours, minutes and seconds as 0:00:00,`morning`: Hours, minutes and seconds are 8:00:00,`end`: indicates hours, minutes and seconds: 23:59:59, Enter an integer to represent the corresponding integer time. For example, enter 9 to represent the hour, minute, and second as 9:00:00. To customize the hour, minute, and second, please enter a string in the corresponding format. |
| yeadDiff | String, Number | `3` | several years before the current year |
| yearAdd | String, Number | `1` | how many years after the current year |

<!-- ### Slots

#### (default) -->

### Events

#### @input

Triggered when the value changes (form validation can detect changes in its value)

| Param | Type | Description |
| ----- | ---- | ----------- |
| $event | Date | changed date value |

#### @change

Triggered when value changes

| Param | Type | Description |
| ----- | ---- | ----------- |
| $event.date | Date | changed date value |

#### @select

Triggered when a date is selected

| Param | Type | Description |
| ----- | ---- | ----------- |
| $event.date | Date | date value after selection |

#### @toggle

Triggered when popping up/hiding

| Param | Type | Description |
| ----- | ---- | ----------- |
| $event.open | Boolean | Pop/hide state |