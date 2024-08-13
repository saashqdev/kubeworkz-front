<template>
  <div
    :class="$style.root"
    :align-right="alignRight"
  >
    <el-select
      v-model="valueType"
      :class="$style.valueTypeInput"
    >
      <el-option
        label="Name"
        value="name"
      />
      <el-option
        label="Label"
        value="label"
      />
      <el-option
        label="Status"
        value="status"
      />
    </el-select>
    <el-select
      v-if="valueType === 'status'"
      v-model="currentValue"
      :class="$style.input"
    >
      <el-option
        v-for="(val, key) in nodeStatusMap"
        :key="val"
        :value="key"
        :label="val"
      />
    </el-select>
    <el-input
      v-else
      v-model="currentValue"
      :class="$style.input"
      v-bind="$attrs"
      :placeholder="placeholder"
      @keydown.enter.native.prevent="search"
    />
    <el-button
      type="primary"
      :disabled="disabled"
      style="margin-left:12px"
      @click="search"
    >
      Search
    </el-button>
  </div>
</template>

<script>
export default {
    name: 'KubeInputSearch',
    props: {
        alignRight: Boolean,
        disabled: Boolean,
        nodeStatusMap: Object,
    },
    data() {
        return {
            valueType: 'name',
            currentValue: '',
        };
    },
    computed: {
        placeholder() {
            const map = {
                name: 'Please enter name to search',
                label: 'Please enter a tag to search, such as: a=a',
                status: 'Please enter status search',
            };
            return map[this.valueType];
        },
    },
    watch: {
        valueType() {
            this.currentValue = '';
        },
    },
    methods: {
        search(event, str) {
            str = str !== undefined ? str : this.currentValue !== undefined ? this.currentValue : '';
            this.$emit('search', { value: str.replace(/^\s+|\s+$/g, ''), valueType: this.valueType });
        },
    },

};
</script>

<style module>
.root { display: flex; text-align: left; }
.root[align-right] { float: right; }

.search[class]{
    position: absolute;
    left: 5px;
    color: #ccc;
}
.valueTypeInput{
  width: 80px;
}
.valueTypeInput :global(.el-input__inner) {
  border-radius: 2px 0 0 2px;
  border-right-width: 0px;
}
.input{
    width: 280px;
    border-radius: 0px 3px 3px 0px;
}
.input :global(.el-input__inner) {
  border-radius: 0px 3px 3px 0px;
}
</style>
