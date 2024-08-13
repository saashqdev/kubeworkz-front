import Vue from 'vue';
import cookie from './handleCookie';

export const mapComponents = components => {
    const result = {};
    components.forEach(component => result[component.options ? component.options.name : component.name] = component);
    return result;
};

export const installComponents = components => {
    if (Array.isArray(components)) { components.forEach(component => Vue.component(component.options ? component.options.name : component.name, component)); } else {
        Object.keys(components).forEach(key => {
            const component = components[key];
            Vue.component(component.options ? component.options.name : component.name, component);
        });
    }
};

export const Wrapper = options => (Object.assign({}, { template: '<div><router-view></router-view></div>' }, options));

/**
 * Get the url that jumps to the platform
 * @param {string} path - path can include the query part
 */
export const getPlatformURL = path => {
    const indexDomain = cookie.readCookie('qz_platform.domain') + (window.location.port ? ':' + window.location.port : '');
    return window.location.protocol + '//' + indexDomain + path;
};
