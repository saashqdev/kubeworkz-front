import { Input } from 'cloud-ui.vusion';
import Validator from '@micro-app/common/utils/validator';

// u-input component with separate validate function
export default {
    name: 'u-validate-input',
    mixins: [ Input ],
    props: {
        rules: Array,
        name: String,
    },
    data() {
        return {
            validator: null,
            valid: false,
            currentMessage: 'test',
        };
    },
    created() {
        // name is a required attribute
        if (!this.name) { throw new Error('Please specify the name attribute of input'); }

        this.validator = new Validator({
            key: this.name,
            rules: this.rules,
        });
    },
    methods: {
        onInput(e) {
            if (!this.compositionInputing) {
                this.currentValue = e.target.value;
                this.$emit('input', this.currentValue);
                this.$emit('update:value', this.currentValue);
                this.validate(this.currentValue);
            }
        },
        onBlur(e) {
            this.validate(this.currentValue);
            this.$emit('blur', e);
        },
        onCompositionEnd(e) {
            // When inputting Chinese, the onInput event will be triggered first, and then this event will be triggered, resulting in the inability to capture Chinese input.
            // Therefore, special processing is required. At this time, the compositionInputing value is true.
            this.compositionInputing = false;
            this.currentValue = e.target.value;
            this.$emit('input', this.currentValue);
            this.$emit('update:value', this.currentValue);
            this.validate(this.currentValue);
        },
        validate(value) {
            value = value || this.currentValue;
            // todo: supports multiple validates
            // errors indicates which rule of the corresponding field reports an error do: supports multiple validates
            this.validator.validate(value, (errors, fields) => {
                this.currentColor = errors ? 'error' : '';
                this.currentMessage = errors && errors[0].message;

                this.$emit('validate', {
                    valid: !errors,
                    message: errors,
                });
            });
        },
    },
};

