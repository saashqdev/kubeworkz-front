/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 * From https://github.com/visionmedia/superagent/blob/master/lib/client.js
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */
import Vue from 'vue';
import _ from 'lodash';
import cookie from '@micro-app/common/utils/handleCookie';
import customConfig from '@micro-app/common/utils/customization';

let Toast = { show: message => { console.error(`vue toast 未就绪:${message}`); }, unmounted: true };
const pushEncodedKeyValuePair = (pairs, key, val) => {
    if (val !== null && val !== undefined) {
        if (Array.isArray(val)) {
            val.forEach(v => {
                pushEncodedKeyValuePair(pairs, key, v);
            });
        } else if (val instanceof Object) {
            for (const subkey in val) { pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]); }
        } else { pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val)); }
    } else if (val === null) { pairs.push(encodeURIComponent(key)); }
};

/**
 * Serialize the given `obj`.
 * From https://github.com/visionmedia/superagent/blob/master/lib/client.js
 * @param {Object} obj
 * @return {String}
 * @api private
 */
const serialize = obj => {
    if (!(obj instanceof Object)) { return obj; }

    const pairs = [];
    for (const key in obj) { pushEncodedKeyValuePair(pairs, key, obj[key]); }

    return pairs.join('&');
};

/**
 * DataTypes
 */
const DATA_TYPES = {
    html: {
        type: 'text/html',
        serialize: v => v,
    },
    json: {
        type: 'application/json',
        serialize: JSON.stringify,
    },
    xml: {
        type: 'application/xml',
        serialize: v => v,
    },
    form: {
        type: 'application/x-www-form-urlencoded',
        serialize,
    },
    formData: {
        type: 'multipart/form-data',
        serialize: v => v,
    },
};

const ERROR_CODE = {
    REQUEST_ERROR: 1,
    JSON_ERROR: 10,
};

// Do not add Cache yet
const caches = {};
const getCacheKey = (url, options) => url + '-' + options.method + '-'
    + JSON.stringify(options.data).replace(/["{}:]/g, '');

/**
 * Export methods
 */
const request = {};
export const headers = () => {
    const inPlatformPage = window.location.href.includes('/public/platform.html#/permission');

    return _.omitBy({
        'Content-Type': 'text/plain;charset=UTF-8',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'If-Modified-Since': '0',
        'X-163-AcceptLanguage': 'zh',
        'x-auth-accountId': cookie.readCookie('accountId'),
        'x-auth-tenantId': inPlatformPage ? '' : cookie.readCookie('tenantId'),
        'x-auth-projectId': inPlatformPage ? '' : cookie.readCookie('projectId'),
        'x-ncs-tenantId': sessionStorage.getItem('ncsTenantId') || '',
        'x-ncs-projectId': sessionStorage.getItem('ncsProjectId') || '',
        'x-nsf-env': localStorage.getItem('envId') || '',
        'x-apm-productId': (localStorage.getItem('ApmProductId') || '').split('-')[0],
        'x-gtxs-region': localStorage.getItem('region'),
    }, val => !val);
};

/**
 * Create a fetch request
 * @param   {string}    url Request url
 * @param   {Object}    options Request parameters
 * @param   {string}    options.method Request method
 * @param   {any}       options.data Requesting data will be processed accordingly according to dataType
 * @param   {string}    options.dataType Request data type, optional html|json|xml|form
 * @param   {Object}    options.headers Configurable request headers
 * @param   {boolean|string}    options.cache Whether to use cache.
 *                      When this parameter is a non-empty string, if the string is passed in when clearing the cache (clearCache), only the cache corresponding to the string will be cleared.
 */
request.fetch = (url, options = {}) => {
    // Toast check, if vusion's toast is ready, use vusion's toast
    if (Toast.unmounted && Vue.prototype.$toast !== undefined) {
        Toast = Vue.prototype.$toast;
        Toast.single = true;
    }
    let requestURL = url;
    options = Object.assign({
        type: 'json',
        method: 'get',
        timeout: 30000,
        headers: headers(),
        credentials: 'same-origin',
    }, options);
    options.method = options.method.toUpperCase();
    if (options.data) {
        const dataType = DATA_TYPES[options.dataType] || DATA_TYPES.json;
        options.headers['Content-Type'] = dataType.type + ';charset=UTF-8';
        // When making a file upload request, Content-type is not set because we don’t know how the boundary is defined.
        options.dataType === 'formData' && delete options.headers['Content-Type'];
        if (options.method === 'GET') { requestURL += '?' + serialize(options.data); } else { options.body = dataType.serialize(options.data); }
    }
    const promise = fetch(requestURL, options)
        .then(res => {
            if (/^2/.test(res.status)) { // http status code = 2xx
                switch (options.type) {
                    case 'json':
                        return res.text().then(text =>
                            (text ? JSON.parse(text) : { code: 200 })
                        );
                    default:
                        res.headers.get('content-type');
                        return res.text();
                }
            } else if (/^3/.test(res.status)) {
                console.log(res);
            } else if (res.status === 401) {
                return res.json().then(data => ({ code: 401, data }));
            } else if (res.status === 406) { // If you are not logged in, jump to the login page.
                window.location.href = customConfig.yun163loginUrl ? customConfig.yun163loginUrl : `/public/login.html#/?redirect=${encodeURIComponent(window.location.href)}`;
            } else if (res.status === 403) {
                return res.json();
            } else if (res.status === 404) {
                return res.json().then(text => text || {});
            } else {
                if (res.status === 502 || res.status === 504) {
                    Toast.error('Component exception');
                }
                console.log("Looks like the response wasn't perfect, got status", res.status);
                if (options.type === 'json') {
                    return res.text().then(text => JSON.parse(text));
                }
                return res.text();

            }
        }).then(data => {
            if (+data.code === 200 || (data.result && +data.result.Code === 200) || +data.Code === 200 || data.Code === 'success') {
                return data.result || data.params || data.list || data;
            } else if (data.status === 400) {
                throw data;
            } else if (typeof (data) === 'string' && options.type === 'text') {
                return data;
            } else if (typeof (data) === 'string' || data.Error) {
                throw data;
            } else if (!data.code && !data.Code && data.status !== 406 && data.status !== 403) {
                return data;
            } else if (data.Code === 'Success' || data.code === 'Success') {
                return data;
            } else {
                throw data;
            }
        })
        .catch(error => {
            // If the code is the following, all error messages will be thrown
            const errCodes = [ 400, 403, 404, 405, 409, 410, 422, 429 ];
            // reason is compatible with custom interface error messages
            const message = error.message || error.Message || error.reason; // Compatible with OpenAPI format
            if (error.code === 401) {
                const msg = message || error.data.message || error.data.Message || error.data.reason;
                Toast.error(msg || 'You don\'t have permission');
                return false;
            } else if (options.noAlert) {
                throw error;
            } else if (errCodes.includes(error.code)) {
                message && Toast.error(message);
            } else if (error.code === 406) {
                // If you are not logged in, jump to the login page.
                window.location.href = customConfig.yun163loginUrl ? customConfig.yun163loginUrl : `/public/login.html#/?redirect=${encodeURIComponent(window.location.href)}`;
            } else {
                if (message === ERROR_CODE.REQUEST_ERROR || /^5/.test(error.code)) {
                    Toast.error('There was a problem with the network or browser, please try again later.');
                }
                throw error;
            }
            throw error;
        });

    return promise;
};

[ 'get', 'put', 'post', 'head', 'delete' ].forEach(method => {
    /**
     * Fetch shortcut
     * @param   {string}    url Request url
     * @param   {any}       data Requesting data will be processed accordingly according to dataType
     * @param   {string}    dataType Request data type, optional html|json|xml|form
     * @example
     *   base.get('/api/v1/posts', { id: 21 })
     *      .then(function (result) {
     *          console.log(result);
     *      });
     *
     *   base.post('/api/v1/posts', { title: 'title', content: 'content goes here' }, 'form')
     *      .then(function (result) {
     *          console.log(result);
     *      });
     */
    request[method] = (url, data, dataType, options) => {
        const allOptions = Object.assign({
            method,
            data,
            dataType,
        }, options);
        return request.fetch(url, allOptions);
    };
});

export default request;

/**
 * Create object data and export it to a file
 * @param {object} options - Request parameters
 * @param {string} options.name - File name
 * @param {string} options.body - Document content
 * @description If necessary later, you can create a file type (type) and expose it.
 */
export const downloadFile = options => {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(new Blob([ options.body ], { type: 'application/octet-stream' }));
    a.href = url;
    a.download = options.name;
    a.click();
    window.URL.revokeObjectURL();
};
