# Well

## Example
### Basic form

``` vue
<template>
     <u-icon-input style="width:300px" @reset="resetSearch" close @keypress.enter="startSearch" :value="keyWord" v-model="keyWord" placeholder="Enter search keywords">
    </u-icon-input>
</template>
<script>
export default {
    data() {
        return {
            keyWord: 'test',
        };
    },
    methods: {
        resetSearch($event) {
            // closeClick to reset search content
        },
        startSearch() {
            // Start search
        },
    },
};
</script>
```

## MonitorOptionbar API
### Attrs/Props
| Attr/Prop | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| icon | String | `'search'` | icon type, only built-in search |
| .... | Other | ui-input | ui-input  |


### Events（See ui-input in the ui library used）

