<template>
  <div>
    <template v-if="currentType === 'quick'">
      <el-radio-group
        v-model="quickValue"
        @change="handleQuickValueChange"
      >
        <el-radio-button
          v-for="(item, index) in quickOptions"
          :key="index"
          :label="item.value"
        >
          {{ item.text }}
        </el-radio-button>
      </el-radio-group>
      <el-link
        style="margin-left:8px"
        type="primary"
        @click="handleChangeCurrentType('custom')"
      >
        Customize
      </el-link>
    </template>
    <template
      v-else
    >
      <el-date-picker
        v-model="customStartTime"
        type="datetime"
        placeholder="Starting Time"
        :clearable="false"
      />
      to
      <el-date-picker
        v-model="customEndTime"
        type="datetime"
        placeholder="End Time"
        :clearable="false"
      />
      <el-button
        style="margin-left:8px"
        type="primary"
        @click="handleOk"
      >
        OK
      </el-button>
      <el-link
        style="margin-left:8px"
        type="primary"
        @click="handleChangeCurrentType('quick')"
      >
        Return to default
      </el-link>
    </template>

    <!-- <el-date-picker

      v-model="timeRange"
      type="datetimerange"
      range-separator="to"
      start-placeholder="Start date"
      end-placeholder="End date">
    </el-date-picker> -->
  </div>
</template>
<script>
export default {
    props: {
        quickOptions: {
            type: Array,
            default: () => {
                return [
                    { text: 'Last 30 minutes', value: 30 * 60 * 1000 },
                    { text: 'Last 6 hours', value: 360 * 60 * 1000 },
                    { text: 'Last 1 day', value: 1440 * 60 * 1000 },
                ];
            },
        },
        date: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            currentType: 'quick', // quick custom
            quickValue: '',
            startTime: new Date(this.date.startTime),
            endTime: new Date(this.date.endTime),
            customStartTime: new Date(this.date.startTime),
            customEndTime: new Date(this.date.endTime),
        };
    },
    computed: {
        st() {
            return this.startTime.getTime();
        },
        et() {
            return this.endTime.getTime();
        },
        timeRange() {
            return { startTime: this.st, endTime: this.et, type: this.currentType, quickValue: this.quickValue };
        },
    },
    watch: {
        quickOptions(val) {
            this.initTime();
        },
        timeRange(val) {
            this.$emit('update', val);
        },
        customStartTime(val) {
            if (val.getTime() > this.customEndTime.getTime()) {
                this.customEndTime = new Date(val.getTime());
            }
        },
        customEndTime(val) {
            if (val.getTime() < this.customStartTime.getTime()) {
                this.customStartTime = new Date(val.getTime());
            }
        },
    },
    created() {
        this.initTime();
    },
    methods: {
        initTime() {
            this.quickValue = this.quickOptions[0] ? this.quickOptions[0].value : '';
            this.currentType = 'quick';
            const start = new Date();
            const end = new Date();
            start.setTime(start.getTime() - this.quickValue);
            this.startTime = start;
            this.endTime = end;
        },
        handleOk() {
            const start = new Date(this.customStartTime.getTime());
            const end = new Date(this.customEndTime.getTime());
            this.startTime = start;
            this.endTime = end;
        },
        handleChangeCurrentType(val) {
            if (val === 'quick') {
                this.initTime();
                this.currentType = val;
            } else {
                this.currentType = val;
                const start = new Date(this.startTime.getTime());
                const end = new Date(this.endTime.getTime());
                this.customStartTime = start;
                this.customEndTime = end;
            }
        },
        handleQuickValueChange(val) {
            console.log(val);
            const start = new Date();
            const end = new Date();
            start.setTime(start.getTime() - val);
            this.startTime = start;
            this.endTime = end;
        },
    },
};
</script>
