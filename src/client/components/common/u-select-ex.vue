<template>
  <u-suggest
    v-if="suggest"
    ref="suggest"
    :disabled="disabled"
    :value="current"
    :placeholder="placeholder"
    v-bind="suggestAttrs"
    :data-source="dataSource"
    strict
    @input="onInput"
    v-on="$listeners"
    @change="onChange"
  >
    <slot />
  </u-suggest>
  <span
    v-else
    :class="$style.root"
  >
    <u-select
      ref="selectVM"
      :value="current"
      :disabled="disabled"
      v-bind="normalAttrs"
      @input="onInput"
      v-on="$listeners"
    >
      <slot>
        <u-select-item
          v-for="(item, index) in data"
          :key="`${item.vaule}_${index}`"
          :value="item.value"
        >
          {{ item.text }}
        </u-select-item>
      </slot>
    </u-select>
    <span
      v-if="notValue && placeholder"
      :class="$style.placeholder"
    >{{ placeholder }}</span>
  </span>
</template>

<script>
import _ from 'lodash';
export default {
    name: 'USelectEx',
    props: {
        value: [ String, Number ],
        placeholder: String,
        suggest: Boolean,
        disabled: Boolean,
        dataSource: Object,
        data: Array,
    },
    data() {
        return {
            current: this.value || '',
        };
    },
    computed: {
        normalAttrs() {
            const p = Object.assign({}, this.$attrs);
            delete p.dataSource;
            return p;
        },
        suggestAttrs() {
            const p = Object.assign({}, this.$attrs);
            delete p.data;
            delete p.dataSource;
            return p;
        },
        notValue() {
            return !this.current;
        },
    },
    watch: {
        value(val) {
            this.current = val || '';
        },
    },
    methods: {
        onInput(value) {
            this.current = value;
            this.$emit('input', value);
            this.$emit('update:value', value);
        },
        onChange({ value, oldValue }) {
            this.current = value;
            // After losing focus, refresh the list
            if (!value) {
                clearTimeout(this.iTimer);
                this.iTimer = setTimeout(() => {
                    this.$nextTick(() => this.fixFetchData());
                }, 300);
            }
        },
        fixFetchData() {
            if (!this.suggest) { return; }
            const that = this.$refs.suggest;
            if (that) {
                that.filterText = that.currentText || '';
                that.debouncedFetchData();
            }
        },
    },
};
</script>

<style module>
.root {
    position: relative;
}
.placeholder {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    margin-top: 1px;
    pointer-events: none;
}
</style>
