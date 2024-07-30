import Vue from 'vue';
Vue.use({
    install(Vue) {
        Vue.prototype.$modal = {
            show(name, data) {
                const modal = this.map[name];
                modal.open(data);
            },
            hide(name, data) {
                const modal = this.map[name];
                modal.close(data);
            },
            map: {},
            // The following logic records the number of currently existing Modals to handle the situation of closing a Modal when there are multiple Modals.
            // After the overall migration to Vue, this logic can be removed
            count: 0,
            addModal() {
                this.count++;
            },
            delModal() {
                this.count--;
            },
            hasModal() {
                return !!this.count;
            },
        };
    },
});
export default {
    beforeCreate() {
        const modalName = this.$attrs['modal-name'];
        if (modalName) {
            this.$modal.map[modalName] = this;
        }
    },
    destroyed() {
        const modalName = this.$attrs['modal-name'];
        if (modalName && this.$modal.map[modalName] === this) {
            delete this.$modal.map[modalName];
        }
    },
    props: {
        showModal: { type: Boolean, default: false },
    },
    data() {
        return {
            show: this.showModal || false,
        };
    },
    resetModal: true, // Set whether reset is required
    watch: {
        showModal(value) {
            this.show = value;
        },
        show(value) {
            if (value)
                this.$modal.addModal();
            else
                this.$modal.delModal();

            if (this.$options.resetModal && !value)
                this.resetModal();
            this.$emit('update:showModal', value);
            // hive specialization
            this.dispatchParent && this.dispatchParent('handleMask', {
                action: this.$modal.hasModal() ? 'open' : 'close',
            });
        },
    },
    methods: {
        open() {
            this.show = true;
        },
        close() {
            this.show = false;
        },
        resetModal() {
            const staticData = this.$options.staticData || [];
            const resetData = this.$options.data.apply(this);
            staticData.push('show');
            for (const name of staticData)
                delete resetData[name];
            Object.assign(this.$data, resetData);
        },
    },
};
