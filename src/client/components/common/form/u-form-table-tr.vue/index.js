import uFromItems from '../u-form-items.vue/index';
import Validator from 'vusion-async-validator';

export default {
    name: 'u-form-table-tr',
    isField: true,
    props: {
        disabled: Boolean,
        topAlign: { type: Boolean, default: true }, // vertical-align: top;
        ignore: { type: Boolean, default: false }, // Whether to ignore the logical check of the corresponding line
        canBeEmpty: { type: Boolean, default: true }, // Whether to allow empty arrays
        isEmpty: { type: Function }, // How to judge whether it is an invalid array item
        global: { type: Boolean, default: true }, // Whether to throw events to u-form
    },
    mixins: [uFromItems],
    created() {
        this.dispatch('u-form-table', 'add-item-tr', this);
    },
    destroyed() {
        this.dispatch('u-form-table', 'remove-item-tr', this);
    },
    data() {
        return {
            canRemove: false,
            table: undefined,
        };
    },
    computed: {
        dynamic() {
            return this.table ? this.table.dynamic : false;
        },
        currentIndex() {
            if (this.table) {
                const index = this.table.trList.findIndex((item) => item === this);
                return index > -1 ? index : 0;
            } else
                return 0;
        },
        isEmptyValid() {
            return (this.table && this.table.trList.length === 1 && !this.canBeEmpty && this.isEmpty) ? !this.isEmpty() : true;
        },
    },
    methods: {
        removeTr() {
            if (this.disabled)
                return;
            this.$emit('remove');
        },
        validate(trigger = 'submit', silent = false) {
            this.dispatch('u-form-table', 'change-item-tr', true);
            this.state = 'validating';
            const validateAll = this.fieldVMs.filter((fieldVM) => fieldVM.$attrs.name).map((fieldVM, i) => {
                let rules = this.currentRules[fieldVM.$attrs.name];
                fieldVM.currentColor = undefined;
                rules = rules && rules.filter((rule) => (rule.trigger + '+submit').includes(trigger)).filter((item) => !item.ignore);
                if (!rules || !rules.length) {
                    this.dispatch('u-form-table', 'validate-item-tr', true);
                    this.global && this.dispatch('u-form', 'validate-item-vm', true);
                    return Promise.resolve();
                }

                // For multiple input boxes in a single line, using this.name will be repeated, and the validator.validate() method will report an error.
                // const name = this.name || 'field';
                const name = fieldVM.$attrs.name || 'field';
                const validator = new Validator({
                    [name]: rules,
                });

                return new Promise((resolve, reject) => {
                    // The index here is the index of the current validate item among u-inputs-** related components.
                    // In the declaration of rules, it can be obtained through options.index in (rule, value, callback, source, options)
                    validator.validate({ [name]: fieldVM.value }, { firstFields: true, index: this.currentIndex }, (errors, fields) => {
                        if (errors) {
                            !silent && (fieldVM.currentColor = 'error');
                            reject(errors);
                        } else
                            resolve();
                    });
                });
            });
            return Promise.all(validateAll).then(() => {
                this.state = this.isEmptyValid ? 'success' : 'error';
                if (!silent) {
                    this.currentMessage = this.message;
                }
                this.dispatch('u-form-table', 'validate-item-tr', true);
                this.global && this.dispatch('u-form', 'validate-item-vm');
            }).catch((errors) => {
                this.state = 'error';
                if (!silent) {
                    this.currentMessage = errors.length && errors[0].message;
                }
                // The validate information sent to u-form-table can accurately locate which sub-component under u-form has a problem.
                this.dispatch('u-form-table', 'validate-item-tr', !errors);
                // The validate information sent to u-form can enable the validation to be done uniformly in u-form.
                this.global && this.dispatch('u-form', 'validate-item-vm', !errors);
            });
        },
    },
};
