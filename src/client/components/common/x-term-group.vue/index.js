import { Tabs } from 'cloud-ui.vusion';

export default {
    name: 'x-term-group',
    mixins: [Tabs],
    props: {
        // value: null,
        // readonly: { type: Boolean, default: false },
        // disabled: { type: Boolean, default: false },
        blank: { type: Boolean, default: false }, // Click to expand whether to open a new page
        to: [Object, String],
        show: false,
        isFullScreen: Boolean,
        maximized: { type: Boolean, default: false }, // If it is passed in from the parent component and is true, subsequent dbclock is not allowed to change the value of currentMaximized.
    },
    data() {
        return {
            minimized: false,
            currentMaximized: this.maximized,
        };
    },
    watch: {
        maximized() {
            this.currentMaximized = this.maximized;
        },
        minimized(value) {
            this.$emit('minimize', !!value);
        },
    },
    created() {
        this.$on('exit-item-vm', (itemVM) => {
            this.exit();
        });
    },
    methods: {
        maximize() {
            (!this.isFullScreen && !this.blank) && (this.currentMaximized = !this.currentMaximized);
        },
        close(itemVM) {
            if (this.readonly || this.disabled || itemVM.disabled)
                return;

            const oldValue = this.value;

            let cancel = false;
            this.$emit('before-close', {
                value: itemVM && itemVM.value,
                oldValue,
                itemVM,
                preventDefault: () => cancel = true,
            });
            if (cancel)
                return;

            itemVM.parentVM = undefined;
            const index = this.itemVMs.indexOf(itemVM);
            this.itemVMs.splice(index, 1);

            // The name of emit here is close, which will cause the browser to crash. . .
            cancel = false;
            this.$emit('closeItem', {
                value: itemVM && itemVM.value,
                oldValue,
                itemVM,
                preventDefault: () => cancel = true,
            });
            if (cancel)
                return;

            if (this.selectedVM === itemVM) {
                this.selectedVM = this.itemVMs[index] || this.itemVMs[index - 1];
                const value = this.selectedVM && this.selectedVM.value;
                this.$emit('input', value);
                this.$emit('update:value', value);
            }
        },
        closeAll() {
            this.$confirm({
                title: 'Hint',
                // content: 'Closing will disconnect all connections to the server',
                content: 'Disconnect from the server?',
                ok: () => Promise.resolve(this.$emit('closeAll')),
            });
        },
        // The link has been disconnected normally and the pop-up window can only be closed.
        exit() {
            this.$confirm({
                title: 'Hint',
                content: 'The line is disconnected',
                showCancel: false,
                isCancelPrimary: false,
                ok: () => Promise.resolve(this.$emit('exit')),
                cancel: () => Promise.resolve(this.$emit('exit')),
            });
        },
    },
};
