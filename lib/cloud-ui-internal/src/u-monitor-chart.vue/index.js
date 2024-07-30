// Do not change the LineChart reference. This reference refers to the chart in the ui theme library from "cloud-ui.vusion", which will cause bugs.
import LineChart from 'cloud-ui.vusion/src/u-line-chart.vue/index.js';
import date from '../utils/filters/date';

export default {
    name: 'u-monitor-chart',
    mixins: [LineChart],
    props: {
        unit: { type: String, default: '' },
        xAxis: { type: Object, default() {
            return {
                key: 'timestr',
                count: 6,
            };
        } },
        yAxis: { type: Object, default() {
            return {
                min: 0,
                name: '',
                count: 6,
            };
        } },
        options: { type: Object, default() {
            return {
                type: 'monitor',
                startTime: 0,
                endTime: 0,
                period: undefined,
                statistics: 'average',
            };
        } },
        data: {
            type: Array,
            default: () => [],
        },
        metrics: {
            type: Array,
            default: () => [],
        },
        chartSum: { type: Boolean, default: false },
        type: { type: String, default: 'monitor' },
        processor: Function,
        preprocessor: Function,
        dimensions: { type: String, default: '' },
        dataType: { type: String, default: '' },
    },
    data() {
        return {
            fill: true,
            loading: true, // 加载数据
            settings: {},
            legendTemplate: '',
            lengendNum: '', // legend个数，包括更换按钮
        };
    },
    watch: {
        unit(value, oldValue) {
            this.yAxis.name = value;
        },
    },
    created() {
        this.$on('refresh', (data) => {
            this.refresh(data);
        });

        if (this.settings.hasOwnProperty('yAxisMin'))
            this.yAxis.min = this.settings.yAxisMin;
        if (this.settings.hasOwnProperty('xAxisCount'))
            this.xAxis.count = this.settings.xAxisCount;

        if (this.modal)
            this.xAxis.count = 10;
    },
    methods: {
        refresh(data) {
            // todo: Use watch to implement
            this.yAxis.name = this.unit;
            this.loading = true;
            let promise;
            // If there is preprocessing, get the promise directly from the preprocessing
            if (data)
                promise = Promise.resolve(data);
            else if (this.preprocessor)
                promise = this.preprocessor(this.options, this);
            else {
                // The default chart backend request, which requires you to specify the data yourself during localization, and at the same time return data that conforms to the processing results.
                promise = this.defaultProcessor();
            }
            promise.then((data) => {
                const showDate = data[0] ? new Date().toDateString() !== new Date(data[0].timestamp).toDateString() : false;
                data.forEach((item) => {
                    item.timestr = date.dateFormat(item.timestamp, showDate ? 'MM-dd HH:mm' : 'HH:mm');
                    item.datetime = date.dateFormat(item.timestamp, 'yyyy-MM-dd HH:mm');
                });
                return data;
            });
            // Follow-up processing
            if (this.processor)
                promise = promise.then(this.processor.bind(this));
            promise.then((data) => {
                const showDate = data[0] ? new Date().toDateString() !== new Date(data[0].timestamp).toDateString() : false;
                // Dealing with chart number issues
                const TICKES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30, 40, 50, 100, 200, 500, 1000, 1];
                const _xAxisCount = this.xAxis.count || 12;
                let pieceCounts = data.length - 1;
                let tick = pieceCounts / _xAxisCount;
                if (tick !== parseInt(tick)) {
                    tick = 1;
                    while (!(pieceCounts / tick <= _xAxisCount && pieceCounts % tick === 0)) {
                        for (let i = 0; i < TICKES.length; i++) {
                            tick = TICKES[i];
                            if (pieceCounts / tick <= _xAxisCount && pieceCounts % tick === 0)
                                break;
                        }
                        // If it is not divisible, add the following points and corresponding abscissas.
                        if (tick === 1) {
                            const item = {
                                timestamp: data[pieceCounts].timestamp + (data[pieceCounts].timestamp - data[pieceCounts - 1].timestamp),
                                hidden: true,
                            };
                            item.timestr = date.dateFormat(item.timestamp, showDate ? 'MM-dd HH:mm' : 'HH:mm');
                            item.datetime = date.dateFormat(item.timestamp, 'yyyy-MM-dd HH:mm');
                            data.push(item);
                            pieceCounts++;
                        } else
                            break;
                    }
                }
                return data;
            }).then((data) => {
                this.$emit('loaded', { data, unit: this.unit });
                this.loading = false;
                this.data = data;
            });
        },
        isAlonePoint(data, index, key) {
            return (data[index - 1] && isNaN(data[index - 1][key])) && !isNaN(data[index][key]) && (!data[index + 1] || isNaN(data[index + 1][key]));
        },
        defaultProcessor() {
            return Promise.reject().then(() => {
                console.error('The current chart reference does not specify a service. To use this chart to process data, please localize and customize the defaultProcessor first.');
            });
        },
    },
};
