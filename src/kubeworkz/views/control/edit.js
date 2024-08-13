import dpEdit from 'kubeworkz/views/control/workload/dp/edit.vue';

import serviceEdit from 'kubeworkz/views/control/service/edit/index.vue';
import ingressEdit from 'kubeworkz/views/control/service/edit/ingress.vue';
import secretEdit from 'kubeworkz/views/control/config/edit-secret.vue';
import configmapEdit from 'kubeworkz/views/control/config/edit-configmap.vue';
import logseerEdit from 'kubeworkz/views/control/logseer/edit/index.vue';
import promethusRuleEdit from 'kubeworkz';
export default {
    props: {
        instance: Object,
    },
    computed: {
        workload() {
            return this.$route.params.workload;
        },
    },
    render(c) {
        const props = {
            instance: this.instance,
        };
        switch (this.workload) {
            case 'services':
                return c(serviceEdit, { props });
            case 'ingresses':
                return c(ingressEdit, { props });
            case 'secrets':
                return c(secretEdit, { props });
            case 'configmaps':
                return c(configmapEdit, { props });
            case 'logconfigs':
                return c(logseerEdit, { props });
            case 'PrometheusRule':
                return c(promethusRuleEdit, { props });
            // case 'alarmManagerEdit':
            //     return c(alarmManagerEdit, { props });
            default:
                return c(dpEdit, { props });
        }
    },
};
