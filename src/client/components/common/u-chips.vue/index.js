import { Field } from 'cloud-ui.vusion';

export default {
    name: 'u-chips',
    mixins: [ Field ],
    props: {
        placeholder: String,
        error: String,
        rules: Array,
        noSpace: Boolean,
        disabled: Boolean,
        allowEmpty: {
            type: Boolean,
            default: true,
        },
        value: Array,
        modifyValue: String, // Keeping error records requires passing this value
        modifyValueIndex: Number,
        canBeEmpty: { type: Boolean, default: false },
    },
    data() {
        return {
            list: this.value,
            item: '',
            modifyItem: '',
            current: -1,
            max: 3,
            modifying: false,
            errMessage: '',
            focus: false,
        };
    },
    watch: {
        item(value) {
            // if (!value)
            //     return;
            this.validate(value);
        },
        modifyItem(value) {
            // if (!value)
            //     return;
            this.validate(value);
        },
        list(value, oldValue) {
            this.$emit('change', { value, oldValue });
            this.$emit('input', value);
        },
        value(value) {
            this.list = value;
        },
        modifying() {
            if (!this.modifying && !this.list.length && !this.allowEmpty) { this.errMessage = this.error; }
        },
    },
    computed: {
        // Number of words per line of textarea
        width() {
            const length = this.item.length;
            const width = length * 8.5 + 60;
            if (length <= 15) { return 200; }
            return (width > 552 ? 552 : width);
        },
        height() {
            const row = Math.ceil(this.item.length / 66) || 1;
            return (row > 6 ? 6 : row) * 26;
        },
        maxHeight() {
            // The width of the input box
            const maxRows = (this.list.length / 4 > 6) ? 6 : (this.list.length / 4);
            return maxRows * 36;
        },
    },
    created() {
        window.addEventListener('keydown', this.onDocKeydown, false);
        // Do I need to keep error messages?
        if (this.modifyValue !== undefined) {
            this.modifyItem = this.modifyValue;
            this.current = +this.modifyValueIndex;
            this.modifying = true;
            this.onModifyBlur();
        }
    },
    destroyed() {
        window.removeEventListener('keydown', this.onDocKeydown, false);
    },
    methods: {
        /**
         * The logic for verification, validate does not pay attention to whether the current event is blur or input
         * @param {string} value - Current detection value
         * @param {string} [type='input'] - Event type
         * @return Error message, no error returns null character
         */
        validate(value, type = 'input', list) {
            list = list || this.list;
            // Empty values ​​or error messages are not detected
            if (!value && value !== '0' || this.errMessage) {
                this.emitValidate(value);
                return;
            }
            // something that failed inspection
            const errRule = this.rules.find(rule => {
                // If the result is true, it means that the verification logic has been passed.
                let result = false;
                if (!type.includes(rule.trigger)) { return false; }
                if (rule.type === 'method') { result = rule.options(value, rule, list); }
                if (rule.type === 'is') { result = rule.options.test(value, list); }
                if (rule.type === 'isNot') { result = !rule.options.test(value, list); }

                return !result;
            });
            this.errMessage = errRule ? errRule.message : '';
            this.emitValidate(value);
        },
        onDocKeydown(event) {
            let { current, list, modifying, modifyItem } = this;

            if (current < 0) { return; }

            // tab key
            if (event.which === 9) {
                event.preventDefault();
                if (modifying) { this.generate(modifyItem, true); } else if (current === (list.length - 1)) { this.$refs.cpInput.focus(); } else { this.onFocus(current + 1); }
            }

            // enter key
            // There is no current judgment here because the function judges it at the beginning.
            if (event.which === 13) {
                this.modifying = true;
                this.modifyItem = list[current];
                list.splice(current, 1);
                this.$nextTick(() => {
                    this.getCpModifyInput().focus();
                });
            }
            // Right click on keyboard
            if (event.which === 39) {
                // The generated item is out of focus, and the edit input box is focused.
                if (current === list.length - 1) {
                    current = -1;
                    this.$refs.cpInput.focus();
                    // Toggles focus of generated items to the right
                } else { this.onFocus(current + 1); }
            }
            // keyboard left button
            if (event.which === 37) {
                // Left border, no longer moves left to generate item focus
                if (current === 0) { return; }
                // Toggles focus of the generated item to the left
                this.onFocus(current - 1);
            }
            // backspace(win) == deleteItem(mac)
            if (event.which === 8) {
                this.deleteItem(current);
                current = -1;
                this.$refs.cpInput.focus();
            }
        },
        /**
         * Edit box is out of focus
         */
        onModifyBlur(event) {
            this.generate(this.modifyItem, true);

            if (!this.errMessage) { this.$refs.cpInput.focus(); }
        },
        /**
         * Focus on the entire large frame
         */
        onFieldClick(event) {
            event.stopPropagation();
            if (this.modifying) { this.getCpModifyInput().focus(); } else { this.$refs.cpInput.focus(); }
        },
        /**
         * Create a focus event callback for the input box
         * @param {object} event - wrapper event object
         */
        onInputFocus(event) {
            this.current = -1;
            this.modifying = false;
            this.focus = true;
        },
        /**
         * Create a blur event callback for the input box
         * @param {object} event - wrapper event object
         */
        onInputBlur(event) {
            this.generate(this.item);
            this.focus = false;

            // if (this.errMessage)
            //     this.$refs.cpInput && this.$refs.cpInput.focus();
        },
        /**
         * Edit box keyboard events
         * @param {object} event - Event wrapper object
         */
        onKeydown(event) {
            event.stopPropagation();
            const { list, item } = this;

            this.errMessage = '';

            // enter key
            // When there is only one line, the default operation of the enter key is disabled.
            if (event.which === 13 && this.height === 26) { event.preventDefault(); }

            // tab key
            // When the input content is empty, restore the default operation of tab
            if (event.which === 9 && item !== '') {
                event.preventDefault();
                this.generate(item);
                this.$refs.cpInput.focus();
            }
            // Spacebar Generate item
            if (event.which === 32 || event.which === 188) {
                // Generate items (meet relevant requirements)
                if (this.$refs.cpInput === document.activeElement && item) {
                    this.generate(item);
                    // After normal generation of items through spaces || commas, characters will remain. reset
                    if (!this.errMessage) {
                        setTimeout(() => {
                            this.item = '';
                        });
                    }
                }
            }
            // Left click || backspace switches focus item
            // If there is no content in the current input box, focus on the latest generated item.
            // item == false && item !== '0'，Description item is an empty string or a string composed of spaces.
            if ((event.which === 37 || event.which === 8) && item === '' && item !== '0') {
                this.item = '';
                this.onFocus(list.length - 1);
            }
        },
        /**
         * Modify the keyboard input of the input box
         * @param {object} event - wrapper event object
         */
        onModifyKeydown(event) {
            event.stopPropagation();
            const { current, modifyItem, modifying } = this;

            this.errMessage = '';

            // enter key
            // Disable the default operation of the default enter key
            if (event.which === 13) { event.preventDefault(); }

            // Spacebar Generate item
            if (event.which === 32 || event.which === 188) {
                // Generate items (meet relevant requirements)
                if (this.getCpModifyInput() === document.activeElement && modifyItem) {
                    this.getCpModifyInput().blur();
                    if (!this.errMessage) { this.$refs.cpInput.focus(); }
                }
            }

            // tab key
            // When the input content is empty, restore the default operation of tab
            if (event.which === 9 && modifyItem !== '') {
                event.preventDefault();
                this.generate(modifyItem, true);
                this.getCpModifyInput().blur();
            }

            // backspace(win) == deleteItem(mac)
            if (event.which === 8) {
                if (modifying && modifyItem === '') {
                    this.modifying = false;
                    this.current = current === 0 ? 0 : current - 1;
                }
            }
        },
        /**
         * Focus on a generated item
         * @param {number} index - Generate the index of the item
         * @param {object} event - wrapped event object
         */
        onFocus(index, $event) {
            $event && $event.stopPropagation();
            this.modifying = false;
            this.$refs.cpInput.blur();
            this.current = index;
            // This is because the keydown event registered on the document requires manual $update.
        },
        /**
         * Double-click the generated item to enter the editing state
         * @param {number} index - Generate the index of the item
         * @param {object} event - wrapped event object
         */
        onDBLClick(index, event) {
            this.modifyItem = this.list[index];
            this.current = index;
            this.modifying = true;
            // Remove the current edit item from the list
            this.list.splice(index, 1);
            this.$emit('input', this.list);
            this.$nextTick(() => {
                this.getCpModifyInput().focus();
            });
        },
        /**
         * Generate items (including generating multiple items at once) items
         * @param {string} item - The content of the generated item
         * @param {boolean} [isModify=false] - Whether to edit a generated item
         */
        generate(item, isModify = false) {
            // item == false，Description item is an empty string or a string composed of spaces.
            if (item === '' && item !== '0') {
                if (isModify) { this.modifyItem = ''; } else { this.item = ''; }
                this.emptyValidate();

                return;
            }

            const hasSpace = !this.noSpace && item.indexOf(' ') !== -1;
            const hasComma = ~item.indexOf(',');
            // Generate an array of multiple items at a time
            // arrIndex is the index of the errored item in the array
            // str is the character of the error part outside the generated item
            let itemArr = [],
                arrIndex = 0;
            if (hasSpace && hasComma) { item = item.replace(/,/g, ' '); }
            if (!hasSpace && !hasComma) { itemArr = [ item ]; } else { itemArr = item.split(hasSpace ? ' ' : ',').filter(item => item); }
            itemArr.every((itm, index) => {
                this.validate(itm, 'input+blur');
                if (this.errMessage) { return false; }

                // Edit generated items
                if (isModify) {
                    // Only if the input is correct, you need to delete the previous item first.
                    this.list.splice(this.current, 0, itm);
                    // Create new build item
                } else { this.list.push(itm); }
                this.$emit('input', this.list);
                arrIndex = index + 1;
                return true;

            });
            itemArr.splice(0, arrIndex);

            const str = itemArr.join(' ');
            isModify ? (this.modifyItem = str) : (this.item = str);
        },
        /**
         * Delete an item
         * @param {number} index - index of an item
         */
        deleteItem(index) {
            this.list.splice(index, 1);
            this.$emit('input', this.list);
            const item = this.modifying ? this.modifyItem : this.item;
            this.validate(item, 'input+blur');
            this.emptyValidate();
        },
        /**
         * External call to see if the data is legal
         */
        $checkValidity() {
            // No changes to created items
            // no error message
            // Create input box has no content
            // There are correct entries
            return !this.modifying && !this.errMessage && !this.item && (this.canBeEmpty ? true : this.list.length);
        },
        getCpModifyInput() {
            return this.$refs.cpModifyInput && (Array.isArray(this.$refs.cpModifyInput) ? this.$refs.cpModifyInput[0] : this.$refs.cpModifyInput);
        },
        emitValidate(value) {
            this.$emit('validate', {
                isValid: !!this.$checkValidity(),
                errMessage: this.errMessage,
                value,
                current: this.current === -1 ? this.list.length : this.current,
            });
        },
        emptyValidate(value = '') {
            if (!this.allowEmpty && !this.list.length) {
                this.errMessage = this.error;
                this.emitValidate(value);
            }
        },
    },
};
