export default {
    // Convert "" undefined undefined/undefined -/undefined -/- to ‘-’
    correctDisplay(s) {
        return /(undefined|-\/|\/-|^$)/.test(s) ? '-' : s;
    },
    logoCode(value) {
        return value && value.slice(0, 2).toUpperCase() || '...';
    },
    /**
     * Extracts non-null values ​​from the target object based on the original object properties
     * ```
     *     var obj0 = {a:0,b:1},
     *         obj1 = {a:"a",b:"b",c:"c"};
     *     // According to the attributes of obj0, copy the non-null attributes from obj1 to obj0
     *     // The result is obj0.a = "a", obj.b = "b", and the c attribute is not copied;
     *     var obj = mergeExist(obj0,obj1);
     * ```
     *
     * @param  {Object} target - target
     * @param  {Object} origin - original object
     * @return {Object}        merged objects
     */
    mergeExist: function mergeExist(target, origin) {
        if (origin) {
            for (const key in origin) {
                const value = origin[key];

                // eslint-disable-next-line
                if (target[key] !== undefined && value != null) {
                    if (value instanceof Array)
                        target[key] = target[key].concat(value);
                    else if ((value instanceof Object) && Object.keys(value).length)
                        mergeExist(value);
                    else if (typeof value !== 'boolean')
                        target[key] = value;
                }
            }
        }
        return target;
    },

    /**
     * Connect url and query
     * @param {string} - url
     * @param {object|string} query - parameter object
     * @returns {string} queryStr
     * @description Values ​​that are false after the !! operation will be ignored
     */
    concatURL(url, query) {
        let queryStr = '';
        if (query instanceof String)
            queryStr = query;
        else if (query instanceof Object) {
            queryStr = Object.keys(query)
                .map((item) => query[item] ? (item + '=' + query[item]) : '')
                .filter((item) => item).join('&');
        } else
            queryStr = (query || '').toString();

        if (queryStr)
            url += ((url.indexOf('?') === -1 ? '?' : '&') + queryStr);

        return url;
    },
    /**
     * Capitalize first letter
     */
    capitalize(str = '') {
        return str.toLowerCase().replace(/( |^)[a-z]/g, (c) => c.toUpperCase());
    },
};
