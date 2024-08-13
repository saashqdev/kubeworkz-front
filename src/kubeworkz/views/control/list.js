import dpList from './workload/list.vue';
import podList from './workload/pod/index.vue';
import serviceList from './service/list.vue';
import pvcList from './pvc/list.vue';
import configList from './config/list.vue';
import logconfigList from './logseer/list.vue';
import alertManagerConfigList from 'kubeworkz/views/control/observable/alert-manager-config/list.vue';
import alertRuleSpecList from 'kubeworkz/views/control/observable/promethus-rule-spec/list.vue';
export default {
    computed: {
        workload() {
            return this.$route.params.workload;
        },
    },
    render(c) {
        switch (this.workload) {
            case 'pods':
                return c(podList);
            case 'services':
            case 'ingresses':
                return c(serviceList);
            case 'persistentvolumeclaims':
                return c(pvcList);
            case 'secrets':
            case 'configmaps':
                return c(configList);
            case 'logconfigs':
                return c(logconfigList);
            case 'AlertmanagerConfig':
                return c(alertManagerConfigList);
            case 'PrometheusRule':
                return c(alertRuleSpecList);
            default:
                return c(dpList);
        }
    },
};
