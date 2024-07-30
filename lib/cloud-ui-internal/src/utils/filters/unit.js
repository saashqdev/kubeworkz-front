import isBoolean from 'lodash/isBoolean';
const base = function (mapArr, unitArr, value, isOpen, startUnit, endUnit) {
    let num = value;
    let startIndex = 0;
    let endIndex;
    const result = {
        num: [],
        unit: [],
    };
    if (isNaN(num) || !Array.isArray(mapArr) || !Array.isArray(unitArr))
        return;

    endIndex = mapArr.length;
    if (endIndex !== unitArr.length)
        return;

    if (!isBoolean(isOpen)) {
        endUnit = startUnit;
        startUnit = isOpen;
        isOpen = false;
    }
    if (startUnit)
        startIndex = unitArr.indexOf(startUnit);

    if (startIndex === -1 || !startIndex)
        startIndex = 0;

    if (endUnit) {
        const targetIndex = unitArr.indexOf(endUnit);
        endIndex = targetIndex === -1 ? endIndex : targetIndex;
    }
    if (startIndex > endIndex)
        return;

    num = num - 0;
    if (!isOpen) {
        // The logical model here is
        /**
         * If endUnit is specified, it will be traced back to this unit.
         * let size = [1024, 'K', 'G'];
         * let result = {
         *     num: [1024/1024/1024],
         *     unit: ['G']
         * };
         *
         * If endUnit is not specified
         * let size = [1024, 'K'];
         * let result = {
         *     num: [1],
         *     unit: ['M']
         * };
         *
         */
        for (let i = startIndex; i < endIndex; i++) {
            const nextLevel = mapArr[i + 1];
            // Maybe there is no next level
            if (nextLevel) {
                const currentNum = num / nextLevel;
                // If the integer part of currentNum is not 0 or the converted unit is specified, the loop will continue to execute.
                if (Math.floor(currentNum) || endUnit) {
                    num = currentNum;
                    result.num = [currentNum];
                    result.unit = [unitArr[i + 1]];
                } else
                    break;
            } else
                break;
        }
        // If there is no result in the previous loop, it means no conversion is needed, and the original value is returned.
        if (!result.num.length) {
            result.num = [num];
            result.unit = [unitArr[startIndex]];
        }
    } else {
        // The logical model here is
        /**
         * If endUnit is specified, the result will be padded with 0 in the corresponding unit.
         * let day = [1000 * 60 * 60, 'ms', 'M'];
         * let result = {
         *     num: [0, 0, 1, 0, 0, 0],
         *     unit: ['M', 'd', 'h', 'm', 's', 'ms']
         * };
         *
         * If endUnit is not specified, the result will not be padded with zeros in the corresponding unit.
         * let day = [1000 * 60 * 60, 'ms'];
         * let result = {
         *     num: [1],
         *     unit: ['h']
         * };
         *
         */
        let i = startIndex;
        for (i; i < endIndex; i++) {
            const nextLevel = mapArr[i + 1];
            if (nextLevel && (num || endUnit)) {
                const currentNum = Math.floor(num / nextLevel);
                const remainder = num % nextLevel;
                // The remainder is put in. If endUnit is specified, it is put in regardless of whether the remainder is 0.
                if (remainder || (!remainder && result.num.length) || endUnit) {
                    result.num.unshift(remainder);
                    result.unit.unshift(unitArr[i]);
                }
                num = currentNum;
            } else
                break;
        }
        if (num || endUnit || !result.num.length) {
            result.num.unshift(num);
            result.unit.unshift(unitArr[i]);
        }
    }
    return {
        getMinUnit(decimal, isShowMinUnit, unitDecimal, modifiedResult) {
            /**
             * Returns the value plus the unit
             */
            const transform = result;
            if (!transform || !transform.num || !transform.unit)
                return;
            if (typeof decimal !== 'number')
                decimal = 0;
            if (isShowMinUnit === undefined)
                isShowMinUnit = false;
            let num = 0;
            let unit = 0;
            const unitObj = {};
            mapArr.forEach((value, index) => {
                unitObj[unitArr[index]] = value;
            });
            for (let i = 0; i < transform.num.length; i++) {
                /**
                 * Align all unit values ​​to the largest unit
                 */
                if (transform.num[i] === 0)
                    continue;
                if (num !== 0)
                    num += transform.num[i] / (unitObj[transform.unit[i - 1]]);
                else {
                    num += transform.num[i];
                    unit = i; // mark maximum unit
                }
            }
            // If the value is 0, unit should be the smallest unit
            if (!num)
                unit = transform.num.length - 1;
            // If unitDecimal is specified and the exact number of digits is not declared for a unit in the period, set decimal to 0
            if (typeof unitDecimal === 'object')
                decimal = unitDecimal[transform.unit[unit]] || 0;
            num = parseFloat(num.toFixed(decimal));
            if (!isShowMinUnit) {
                // Without displaying the minimum unit, when the marked maximum unit is consistent with the starting unit, the unit will not be output.
                if (transform.unit[unit] === startUnit) {
                    return {
                        num,
                        // unit: startUnit,
                        unit: '',
                    };
                }
            }
            return {
                num,
                unit: transform.unit[unit],
            };
        },
        toString(decimal, isShowMinUnit, unitDecimal) {
            const { num, unit } = this.getMinUnit(decimal, isShowMinUnit, unitDecimal);
            return num + unit;
        },
        num: result.num,
        unit: result.unit,
    };
};

const UNIT_MAP = {
    size: {
        mapArr: [1, 1024, 1024, 1024, 1024, 1024],
        unitArr: ['B', 'K', 'M', 'G', 'T', 'P'],
    },
    day: {
        mapArr: [1, 1000, 60, 60, 24, 30],
        unitArr: ['ms', 's', 'm', 'h', 'd', 'M'],
    },
    count: {
        mapArr: [1000, 1000, 1000, 1000, 1000],
        unitArr: ['b', 'K', 'M', 'G', 'x10'],
    },
    number: {
        mapArr: [1, 10000, 10000],
        unitArr: ['', 'Ten thousand', '100 million'],
    },
};
export default {
    /**
     * @param {int} value numerical value
     * @param {stirng} startUnit current unit
     * @param {stirng} targetUnit target unit
     * @param {int} decimal Number of precise decimal places, applied to all units
     * @param {bool} isShowMinUnit Show minimum unit
     * @param {object} unitDecimal A key-value pair of unit: decimal, indicating how many decimal places are required to be precise in this unit.
     */
    size(value, startUnit, targetUnit, decimal, isShowMinUnit) {
        const { mapArr, unitArr } = UNIT_MAP.size;
        return base(mapArr, unitArr, value, false, startUnit, targetUnit);
    },
    sizeStr(value, startUnit, targetUnit, decimal, isShowMinUnit, unitDecimal) {
        const { mapArr, unitArr } = UNIT_MAP.size;
        return base(mapArr, unitArr, value, false, startUnit, targetUnit).toString(decimal, isShowMinUnit, unitDecimal);
    },
    day(value, startUnit, targetUnit, decimal, isShowMinUnit) {
        const { mapArr, unitArr } = UNIT_MAP.day;
        return base(mapArr, unitArr, value, true, startUnit, targetUnit);
    },
    dayStr(value, startUnit, targetUnit, decimal, isShowMinUnit, unitDecimal) {
        const { mapArr, unitArr } = UNIT_MAP.day;
        return base(mapArr, unitArr, value, true, startUnit, targetUnit).toString(decimal, isShowMinUnit, unitDecimal);
    },
    count(value, startUnit, targetUnit, decimal, isShowMinUnit) {
        const { mapArr, unitArr } = UNIT_MAP.count;
        return base(mapArr, unitArr, value, true, startUnit, targetUnit);
    },
    countStr(value, startUnit, targetUnit, decimal, isShowMinUnit, unitDecimal) {
        const { mapArr, unitArr } = UNIT_MAP.count;
        // const result = base(mapArr, unitArr, value, true, startUnit, targetUnit);
        // const { num, unit } = result;
        /**
         * When the original data is 1000, do not display it as 1k but 1000. The data of num is adjusted here.
         * Example: num: [1, 0] unit: ['k', 'b']
         * Adjusted: num: [1000] unit: ['b']
         */
        // for (let i = 0; i < num.length; i++) {
        //     if (!num[i] && i !== num.length - 1) {
        //         // Remove invalid 0's
        //         num.shift();
        //         unit.shift();
        //         i--;
        //         continue;
        //     }
        //     if (num[i].toString().length === 1 && num[i] && i !== num.length - 1) {
        //         // If the unit is 1 digit and is not the last digit
        //         num[i + 1] += num[i] * 1000;
        //         num.shift();
        //         unit.shift();
        //         break;
        //     } else
        //         break;
        // }
        // return result.toString(decimal, isShowMinUnit, undefined, result);
        return base(mapArr, unitArr, value, true, startUnit, targetUnit).toString(decimal, isShowMinUnit, unitDecimal);
    },
    number(value, startUnit, targetUnit, decimal, isShowMinUnit) {
        const { mapArr, unitArr } = UNIT_MAP.number;
        return base(mapArr, unitArr, value, false, startUnit, targetUnit);
    },
};
