import { unit } from '@micro-app/common/filters';

const num = (value) => {
    const tmp = unit.size(value, 'B');
    // Keep to two decimal places
    // Return objects: unit and num
    return tmp.getMinUnit(2);
};
export const sizeProcessor = function(result) {
    // this is monitor-chart
    const keys = this.metrics.map((item) => item.key);
    const max = Math.max.apply(null, _.flatten( result.map((item) => keys.map((key) => item[key])) ));
    const unit = num(isNaN(+max) ? 0 : max).unit || 'B';
    const multiple = Math.pow(1024, ['B', 'K', 'M', 'G', 'T', 'P'].indexOf(unit));
    this.unit = (unit === 'B' || !this.unit.startsWith('B')) ? this.unit : (unit + 'i' + this.unit);

    result.forEach((item) => {
        keys.forEach((key) => item[key] = (item[key] / multiple).toFixed(2));
    });
    return result;
};

export const getStep = (startTime, endTime) => {
    // Whether to use seconds as the minimum unit (one move is milliseconds)
    const isSecond = (endTime + '').length < 12;
    // period is min as unit
    let period = (endTime - startTime) / 60;
    !isSecond && (period = Math.floor(period / 1000));
    // 6h、24h、7d、30d
    const PERIOD_MAP = [0, 6 * 60, 24 * 60, 24 * 7 * 60, 30 * 24 * 60];
    const STEP_MAP = ['1m', '15m', '1h', '6h', '1d'];
    const index = PERIOD_MAP.findIndex((item, index, arr) => index < (arr.length - 1) ? (period >= item && period < arr[index + 1]) : true );

    return STEP_MAP[index];
};

/**
 * Get the parameters in the query part of the request
 * @param {object} options - Some parameters of specific charts
 * @param {number} startTime - Starting time [ms is the smallest unit]
 * @param {number} endTime - End time [ms is the smallest unit]
 * @returns {object} - Request parameter object
 * @description startTime and endTime are not placed in the options object because the acquisition of these two is often dynamic.
 *              options contains static configuration information.
 */
export const getQueryOptions = function(options, startTime, endTime) {
    const tmp = {
        step: '1m', // Default 1m, [1m, 15m, 1h, 6h, 1d]
        // Required
        start: Math.floor(startTime / 1000), // Starting time [s is the smallest unit]
        end: Math.floor(endTime / 1000), // End time [s is the smallest unit]
        name: '', // Monitoring item name
        dimension: '', // Dimensions
        // Optional
        cluster: '', // Cluster name
        node_name: '', // Node name
        namespace: '',
        pod_name: '',
        container_name: '',
        filter_label: '', // Generally, it is not passed. When an interface returns multiple monitoring items, type is passed. The basic configuration corresponding to the chart includes keys. The specific key value is defined by the backend and adapted by the frontend.
        device: '',
        interface: '',
    };

    Object.assign(tmp, options, { step: getStep(startTime, endTime) });
    // Use omitBy to filter out attributes whose corresponding attribute values ​​are empty.
    return _.omitBy(tmp, (value) => !value);
};
