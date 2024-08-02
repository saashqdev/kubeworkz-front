<template>
    <span>
        <u-select v-if="currentData.length" key="list" :disabled="disabled" :size="size" v-model="value" :data="currentData" @select="$emit('select', $event)"></u-select>
        <u-select v-else key="none" :size="size" :data="emptyData" disabled></u-select>
    </span>
</template>

<script>
export default {
    name: 'u-select-with-empty',
    props: {
        data: Array,
        value: [String, Number],
        size: { type: String, default: 'normal' },
        needDefault: { type: Boolean, default: false }, // Whether a null value is required when there is data
        emptyData: { type: Array, default: () => ([{ text: 'No data' }]) },
        disabled: { type: Boolean, default: false },
    },
    watch: {
        value(value) {
            this.$emit('input', value);
            this.$emit('update:value', value);
        },
        data(value) {
            this.currentData = this.getData(value);
        },
    },
    data() {
        return {
            currentData: this.getData(this.data),
        };
    },
    methods: {
        getData(value = []) {
            let tmp = [];
            if (value && value.length)
                tmp = typeof (value[0]) === 'object' ? value : value.map((item) => ({ text: item, value: item }));

            this.needDefault && tmp.length && (tmp = [{ text: 'Please choose', value: '' }].concat(tmp));
            return tmp;
        },
    },

};
</script>
