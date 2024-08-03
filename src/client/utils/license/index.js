import Vue from 'vue';
import licenseService from '@micro-app/common/services/license';
import config from '@micro-app/common/utils/config';

const Toast = {
    show() {},
};

Vue.nextTick(() => {
    const Ctor = Vue.component('u-toast');
    if (!Ctor)
        return;

    const $toast = new Ctor();

    $toast.single = true;
    $toast.position = 'top-right';
    $toast.closable = true;

    Toast.show = function(text, duration = 3000) {
        // $toast.show(text, duration);
        $toast.warning(text, duration);
    };
});

export default Object.assign({
    check: function() {
        licenseService.status().then((status = {}) => {
            if (!status) return;
            if (status.modules_usage) { // for v2
                const cloneStatus = JSON.parse(JSON.stringify(status));
                delete cloneStatus.expired; // Not needed
                delete cloneStatus.usage; // Not needed
                const modules_usage = status.modules_usage;
                delete cloneStatus.modules_usage; // Not needed
                if (Object.keys(cloneStatus).some(key => !!cloneStatus[key])) { // global exception
                    Toast.show('License Abnormal, please contact the platform administrator', 1000 * 6);
                } else { // Module exception
                    const currentModule = config.getCurrModule();
                    if (currentModule) {
                        if (modules_usage[currentModule.key]) {
                            Toast.show(`License Abnormal, please contact the platform administrator`, 1000 * 6);
                        }
                    }
                }
            } else if (Object.keys(status).some(key => !!status[key])) { // for v1
                Toast.show('License Abnormal, please contact the platform administrator', 1000 * 6);
            }
        });
    }
}, Toast);
