<template>
  <div :class="$style.wrap1">
    <div
      ref="wrap"
      :class="$style.wrap"
    >
      <textarea
        ref="defalutValue"
        v-model="current.value"
        v-textareaAuto
        v-autoScroll="true"
        type="text"
        :class="[$style.defaultInput]"
        edit
        rows="1"
        @focus="updateStatus(true)"
        @keyup.backspace.stop.prevent="clearInput($event)"
        @keyup.delete-origin.stop.prevent="stopPropagation($event)"
        @input="checkInput($event)"
        @keyup.up.stop.prevent="stepSelectingTagType($event, 'up')"
        @keyup.down.stop.prevent="stepSelectingTagType($event, 'down')"
        @keyup.left.stop.prevent="focusTag($event)"
        @keyup.right.stop.prevent="stopPropagation($event)"
        @keyup.enter.stop.prevent="updateTag(false,$event)"
        @blur.stop.prevent="updateTag(true,$event)"
      />
      <span
        ref="shadow"
        :mutil="!!info.tags.length"
        :class="[$style.textareaShadow]"
      >
        {{ (current.value || '') + 'zw' }}
        <!-- zw is used for placeholder -->
      </span>
    </div>

    <searchTagType
      v-if="stepData && stepData.type === 'select' && stepData.values"
      :tag-types="stepData.values"
      :selected="info.selected[current.type][current.values.length]"
      @select="stepDataSelectFunc($event)"
    />
  </div>
</template>


<script>
import tagEditBase from './tag.edit.base.vue';
import _ from 'lodash';
export default {
    name: 'SearchTagItemEdit',
    extends: tagEditBase,
    props: {
        placeholder: String,
        tagTypes: Object,
        info: Object,
        current: Object,
    },
    data() {
        const current = this.current;
        current.value = current.show();
        this.resetLastSelect(current);
        current.isEmpty = true;
        return {
            defaultTypeIndex: 0,

            typeIndex: undefined,
            stepData: null,
            stepDataSelect: false,
        };
    },
    watch: {
        'current.edit': {
            immediate: true,
            handler(status) {
                this.toggleInput(status);
            },
        },
    },
    methods: {
        resetLastSelect(current) {
            const lastIndex = current.values.length - 1;
            if (lastIndex >= 0) {
                this.updateSelected(current.type, current.values[lastIndex], lastIndex, true);
            }
            current.values.pop();
        },
        clearInput($event) {
            this.stopPropagation($event);
            const current = this.current;
            const tags = this.info.tags;
            const show = current.show();
            const inputShow = current.value || '';
            const stepData = this.stepData;
            const currentStepIsInput = function() {
                return !stepData || stepData.type === 'input';
            };
            // Subset
            const isSub = function() {
                return show.indexOf(inputShow) !== -1;
            };
            // Mako collection
            const isTrueSub = function() {
                return isSub() && show !== inputShow;
            };
            const resetCurrent = () => {
                this.autoDeleteSelected();
                current.values.length = 0;
                current.value = current.show();
                this.getCheck();
            };
            const resetValue = () => {
                this.resetLastSelect(current);
                current.value = current.show();
                this.getCheck();
            };
            // debugger;
            // There is currently no value entered
            if (!inputShow) {
                resetCurrent();
            } else {
                if (current.values.length) {
                    if (isTrueSub()) {
                        resetValue();
                    }
                } else {
                    if (isTrueSub()) {
                        resetCurrent();
                    }
                }
            }
        },
        checkInput($event) {
            this.stopPropagation($event);
            // This method is triggered before clearInput
            this.getCheck();
            const current = this.current;
            const show = current.show(); // The display value that the current input box should display
            const inputShow = $event && $event.target ? ($event.target.value || '') : (current.value || '');
            current.value = inputShow;
            // If the user selects the query type and the input value type of the current step is not input
            if (this.stepData && this.stepData.type !== 'input') {
                // The value of the current input box is not a subset of the values ​​that should be displayed
                if (show.indexOf(inputShow) === -1) {
                    // Since input is currently not allowed, the default value is restored.
                    current.value = this.$refs.defalutValue.value = show;
                }
            } else {
                this.selectTagType = false;
            }
        },
        updateStatus(status) {
            this.current.edit = status;
            this.current.selecting = status;
            this.toggleInput(status);
        },
        updateTag(isBlur, $event) {
            this.stopPropagation($event);
            const currentOrigin = this.current;
            const current = Object.assign({}, currentOrigin);
            current.values = [].concat(currentOrigin.values);
            const typeIndex = this.typeIndex;
            // If the input is complete
            if (this.isComplete(current)) {
                Object.assign(this.current, {
                    edit: false,
                    selecting: false,
                    values: current.values,
                });
                // Blur will be triggered here, so provide an attribute for subsequent judgment.
                this.isCompleteTmp = true;
                if (!isBlur) {
                    this.$emit('tagdone');
                } else {
                    if (this.selectTagType) {
                        this.selectTagType = false;
                        this.$emit('tagdone');
                    } else {
                        this.$emit('tagdone', {
                            $event: {
                                mute: true,
                            },
                        });
                    }
                }
                return;
                // Use the keyboard to select the type up and down, and press the enter key.
            } else if (_.isNumber(typeIndex) && !isBlur) {
                this.typeIndex = undefined;
                // value type selector
                this.stepDataSelectFunc({
                    value: this.stepSelected,
                });
                this.stepSelected = undefined;
                this.updateTag(false);
                return;
            // Other out-of-focus situations
            } else if (isBlur) {
                if (this.selectTagType) {
                    this.updateStatus(true);
                    this.selectTagType = false;
                    this.focusCampo(this.$refs.defalutValue);
                } else if (!this.isCompleteTmp) {
                    this.$emit('remove');
                } else if (this.isCompleteTmp) {
                    this.isCompleteTmp = false;
                }
            } else if (!isBlur) {
                this.current.value = (this.current.value || '').trim().replace(/[\r\n]/, '');
            }
        },
    },
};
</script>

