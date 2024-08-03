import request, { headers as getHeaders } from './request.js';
import { at } from 'lodash';
export default class Service {
    // handle only allows adding preProcess and process.
    // The process||preProcess added by handle is divided into two types: one is global, specifying the object name as GLOBAL, and the other is the object name.
    // Subordinate attributes can specify the corresponding process or preProcess respectively.
    // Global has the highest priority (todo: adjust priority),
    // Priority: Global > Properties of a single object specified by handle > Properties specified in a single API (process||preProcess)

    // In preProcess, only the final format can be used, that is, the body-related fields in the post interface. It can no longer be declared externally, and no secondary adjustments are made by default. (to do)
    constructor(config, baseUrl = '', handle = {}) {
        const keys = Object.keys(config);
        const { globalPreProcesses, globalProcesses, newHandle } = this.setHandle(handle, true);
        this.globalPreProcesses = globalPreProcesses;
        this.globalProcesses = globalProcesses;
        this.handle = newHandle || {};

        keys.forEach(key => {
            this[key] = (options = {}) => {
                options = this._getOptions(options, config[key]);
                const { method, path, query, body, fetch, dataType, mock, process, preProcess } = options;
                let urlPath = path;
                const preProcesses = [].concat(this.gloablStaticPreprocess, this.globalPreProcesses, this.handle[key] && this.handle[key].preProcess, preProcess).filter(item => item);
                const processes = [].concat(this.globalProcesses, this.handle[key] && this.handle[key].process, process).filter(item => item);
                if (window.isDevServer) {
                    preProcesses.push(this.setGlobalDEVHandler);
                }

                preProcesses.length && preProcesses.forEach(func => options = func(options));

                // Do the variable replacement in the url for the second time
                urlPath = this._replacePath(path, options, false);

                if (mock) {
                    return Promise.resolve(mock).then(result => {
                        processes.forEach(func => result = func(result));
                        return result;
                    });
                }

                if ((method === 'post' || method === 'delete' || method === 'put') && query) { urlPath += '?' + this._serialize(query); }

                if (options.download) { return window.open(baseUrl + urlPath + '?' + this._serialize(query)); }

                // FIXME "...fetch" This operation reports an error? Change it to Object.assgin
                return request[method](baseUrl + urlPath, body || query, dataType || 'json', Object.assign({
                    headers: Object.assign({}, getHeaders(), options.headers), // Support unified operation of headers in the preProcesses stage
                    // ...fetch,
                    noAlert: options.noAlert || false,
                }, fetch)).then(result => {
                    processes.forEach(func => result = func(result));
                    return result;
                });
            };
        });

        // Collection urls
        this.urls = {};
        keys.forEach(key => {
            this.urls[key] = (options = {}) => {
                options = this._getOptions(options, config[key]);
                const { method, path, query, body, fetch, dataType } = options;
                let urlPath = path;

                // Do the variable replacement in the url for the second time
                urlPath = this._replacePath(path, options, false);

                if (query) { urlPath += '?' + this._serialize(query); }

                return baseUrl + urlPath;
            };
        });
    }
    setGlobalDEVHandler(options) {
        console.groupCollapsed(`request: ${options.path}`);
        console.log('%c options', 'color: greenyellow; font-weight: bold', options);
        console.groupEnd();
        return options;
    }
    setHandle(handle = {}, isInit = false) {
        const globalPreProcesses = [];
        const globalProcesses = [];
        const newHandle = {};

        // The specified preProcess || process is unified into an array to facilitate subsequent processing.
        const toArray = param => (Array.isArray(param) ? param : [ param ]);

        Object.keys(handle).forEach(item => {
            const value = handle[item];
            const [ preProcess, process ] = at(value || {}, [ 'preProcess', 'process' ]);
            if (!value) return;

            if (item === 'GLOBAL') {
                preProcess && globalPreProcesses.push(...toArray(preProcess));
                process && globalProcesses.push(...toArray(process));
            } else {
                newHandle[item] = {
                    preProcess: [],
                    process: [],
                };
                preProcess && newHandle[item].preProcess.push(...toArray(preProcess));
                process && newHandle[item].process.push(...toArray(process));
            }
        });

        if (!isInit) {
            // console.log('you have a ');
            this.globalPreProcesses.push(...globalPreProcesses);
            this.globalProcesses.push(...globalProcesses);
            Object.keys(newHandle).forEach(item => {
                const value = newHandle[item];
                this.handle[item] = {
                    preProcess: [],
                    process: [],
                };

                value.preProcess.length && this.handle[item].preProcess.push(...value.preProcess);
                value.process.length && this.handle[item].process.push(...value.process);
            });
        } else {
            // console.log(globalPreProcesses)
            return { globalPreProcesses, globalProcesses, newHandle };
        }
    }
    /**
     *
     *
     * @param {*} path Path (need to replace the corresponding field)
     * @param {*} options Parameter
     * @param {boolean} [isFirst=true] Whether it is the first replacement (the second replacement is after preProcess)
     * @return
     * @memberof Service
     */
    _replacePath(path, options, isFirst = true) {
        return path ? path.replace(/\{(.*?)\}/g, (match, key) => {
            const value = (options.params && options.params[key]) || options[key];

            if (isFirst) {
                value !== undefined && delete options[key];
                // If the corresponding variable is not defined, no processing will be performed. It will be processed during the second variable replacement.
                return value === undefined ? match : value;
            }
            // At this time, if there is an undefined variable in path, an error will be reported.
            if (value === undefined) { throw new Error(`Please specify path: field value corresponding to ${key} in ${path}`); }
            delete options[key];
            return value;

        }) : '';
    }
    /**
     *
     *
     * @param {*} [options={}]
     * @param {*} [apiOptions={}]
     * @return
     * @memberof Service
     * @description The replacement of path is also done directly.
     */
    _getOptions(options = {}, apiOptions = {}) {
        // params represents an object formed by the fields that need to be replaced in path. If some parameters have not been replaced, they will be directly discarded and will not be used for other purposes.
        const KEYWORDS = [ 'path', 'params', 'headers', 'query', 'body', 'fetch', 'method', 'dataType', 'noAlert', 'mock', 'preProcess', 'process', 'download' ];
        const newOptions = Object.assign({ method: 'get' }, apiOptions, options);
        // There may be two situations for body, put || post
        const subKey = newOptions.method === 'get' ? 'query' : 'body';
        !newOptions[subKey] && (newOptions[subKey] = {});
        if (options.query && apiOptions.query) {
            Object.assign(newOptions.query, apiOptions.query, options.query);
        }
        if (newOptions.action && newOptions.version) {
            newOptions.query = newOptions.query || {};
            newOptions.query.Action = newOptions.action;
            newOptions.query.Version = newOptions.version;
            delete newOptions.action;
            delete newOptions.version;
        }

        // First time doing variable substitution in url
        newOptions.path = this._replacePath(newOptions.path, newOptions);

        for (const key in newOptions) {
            if (!KEYWORDS.includes(key)) {
                newOptions[subKey][key] = newOptions[key];
                delete newOptions[key];
            } else { newOptions[key] = newOptions[key]; }
        }

        // There is no query || body setting [when it is a normal object, no attributes], delete it directly
        if (!Object.keys(newOptions[subKey]).length && !(newOptions[subKey] instanceof FormData)) { delete newOptions[subKey]; }

        return newOptions;
    }
    _serialize(obj) {
        if (!(obj instanceof Object)) { return obj; }

        const pairs = [];
        for (const key in obj) { this._pushEncodedKeyValuePair(pairs, key, obj[key]); }

        return pairs.join('&');
    }
    _pushEncodedKeyValuePair(pairs, key, val) {
        if (val !== null && val !== undefined) {
            if (Array.isArray(val)) {
                val.forEach(v => {
                    this._pushEncodedKeyValuePair(pairs, key, v);
                });
            } else if (val instanceof Object) {
                for (const subkey in val) { this._pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]); }
            } else { pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val)); }
        } else if (val === null) { pairs.push(encodeURIComponent(key)); }
    }
}

Service.prototype.gloablStaticPreprocess = [];
