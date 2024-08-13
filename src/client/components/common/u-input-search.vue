<template>
  <u-linear-layout
    :class="$style.root"
    :align-right="alignRight"
  >
    <u-input
      v-model="currentValue"
      :size="size"
      :disabled="disabled"
      :placeholder="placeholder"
      :class="$style.input"
      close
      @keyup.enter="search"
      @reset="search($event, '')"
    >
      <u-icons
        :class="$style.search"
        name="search"
      />
    </u-input>
    <u-button
      color="primary"
      :disabled="disabled"
      @click="search"
    >
      Search
    </u-button>
  </u-linear-layout>
</template>

<script>
export default {
    name: 'UInputSearch',
    props: {
        name: { type: String, default: 'name' }, // The name of the search subject
        width: { type: String, default: 'large' }, // The length of the input input box
        disabled: { type: Boolean, default: false },
        alignRight: false,
        value: String,
    },
    data() {
        return {
            currentValue: this.value,
        };
    },
    computed: {
        size() {
            return 'large ' + this.width;
        },
        placeholder() {
            return `Please enter ${this.name} search`;
        },
    },
    watch: {
        value(value) {
            this.currentValue = value;
        },
        currentValue(value) {
            this.$emit('update:value', value);
        },
    },
    methods: {
        // After the reset event is thrown, only the value inside the input component can be changed. You need to call $nextTick to synchronize the value in the parent component.
        // reset() {
        // },
        search(event, str) {
            str = str !== undefined ? str : this.currentValue !== undefined ? this.currentValue : '';
            this.$emit('search', str.replace(/^\s+|\s+$/g, ''));
        },
    },
};
</script>

<style module>
.root { display: inline-block; text-align: left; }
.root[alignRight] { float: right; }

.search[class]{
    position: absolute;
    left: 5px;
    color: #ccc;
}
.input[class]{
    padding-left: 30px !important;
}
</style>
