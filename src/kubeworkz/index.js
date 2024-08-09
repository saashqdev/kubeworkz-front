import 'kubeworkz/style/global.scss';
import 'kubeworkz/style/index.css';
import Vue from 'vue';
import 'nprogress/nprogress.css';
import * as Components from 'library';
import * as directives from 'cloud-ui.vusion/src/base/directives';
import filters from '@micro-app/common/filters/filter';
import { install, installFilters, installDirectives } from 'vusion-utils';
// import { customRouter } from '../utils/router';
import ILineAwesome from 'i-line-awesome.vue';
// import docTitle from '@micro-app/common/mixins/docTitle';
Vue.component(ILineAwesome);
// Vue.mixin(docTitle);
install(Components, Vue);
// Register global components in the project
installFilters(filters, Vue);
installDirectives(directives, Vue);

import router from 'kubeworkz/router';
import store from 'kubeworkz/store';
// import initService from '../services/init';
// initService(router);
import './plugins/vee-validate';
import './plugins/vue-meta';
import './plugins/kubeworkz';
new Vue({
    el: '#app',
    router,
    store,
    render: c => c('router-view'),
});
