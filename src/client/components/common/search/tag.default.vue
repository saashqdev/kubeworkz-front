<template>
  <div :class="$style.wrap1">
    <div
      ref="wrap"
      :class="$style.wrap"
    >
      <textarea
        v-if="showInput"
        ref="defalutValue"
        v-model="current.value"
        v-textareaAuto
        v-autoScroll="true"
        type="text"
        :edit="!!current.value"
        :class="[$style.defaultInput]"
        :placeholder="info.tags.length ? '' : placeholder"
        rows="1"
        @input="checkInput($event)"
        @focus="updateStatus(true)"
        @keyup.delete.stop.prevent="clearInput($event)"
        @mousedown="foucsInput"
        @keyup.up.stop.prevent="selectingTagType('up', $event)"
        @keyup.down.stop.prevent="selectingTagType('down', $event)"
        @keyup.left.stop.prevent="focusTag($event)"
        @keyup.right.stop.prevent="stopPropagation($event)"
        @keyup.enter.stop.prevent="addTag(false, $event)"
        @blur.stop.prevent="addTag(true, $event)"
      />
      <span
        v-if="showInput"
        ref="shadow"
        :mutil="!!info.tags.length"
        :class="[$style.textareaShadow]"
      >
        {{ (current.value || '') + 'zw' }}
        <!-- zw is used for placeholder -->
      </span>
    </div>
    <searchTagType
      v-if="stepData && stepData.type === 'select'"
      :tag-types="stepData.values"
      :selected="(info.selected[current.type] || [])[current.values.length]"
      @select="stepDataSelectFunc($event)"
    />

    <searchTagType
      v-if="showType"
      ref="searchTagType"
      type="default"
      :tag-types="tagTypes"
      :selected="getAllSelected()"
      @select="selectTagTypeFunc($event)"
    />
  </div>
</template>

<script>
import tagEditBase from './tag.edit.base.vue';
import util from './util';
import _ from 'lodash';
export default {
    name: 'SearchTagItemDefault',
    extends: tagEditBase,
    props: {
        tagTypes: Object,
        info: Object,
        placeholder: String,
    },

    data() {
        return {
            current: this.defaultCurrent(),
            typeIndex: undefined,
            stepData: null,
            stepDataSelect: false,
        };
    },
    computed: {
        showInput() {
            const current = this.current;
            const tags = this.info.tags;
            const showInput = current.edit || (!current.edit && !tags.length);
            return showInput || this.info.active;
        },
        showType() {
            const current = this.current;
            return current.edit && !current.type && !current.value;
        },
    },
    watch: {
        'current.edit': function(status) {
            this.toggleInput(status);
        },
        'info.active': function(active) {
            if (!active) {
                this.clearSelectingTagType();
            }
        },
        'info.focusInput': {
            immediate: true,
            handler(showInput) {
                this.toggleInput(showInput);
            },
        },
    },
    methods: {
        noop() {
            return '';
        },
        resetCurrentTag(isEdit) {
            this.current = this.defaultCurrent();
            this.updateStatus(isEdit);
            this.stepData = undefined;
        },
        defaultCurrent() {
            this.clearSelectingTagType();
            return {
                values: [],
                show: this.noop,
                value: undefined,
                isEmpty: true,
                edit: false,
                selecting: false,
                type: '',
            };
        },
        getAllSelected() {
            return Array.from(new Set((this.info.tags || []).map(item => {
                return item.type;
            })));
        },
        addTag(isBlur, $event) {
            const currentOrigin = this.current;
            const current = Object.assign({}, currentOrigin);
            current.values = [].concat(currentOrigin.values);
            const typeIndex = this.typeIndex;
            // If the input is complete
            if (this.isComplete(current)) {
                this.tagAdd(current);
                this.clearSelectingTagType();
                if (isBlur && !this.selectTagType) {
                    this.resetCurrentTag(false);
                    this.$emit('blurTag');
                } else {
                    this.info.active = true;
                    this.info.defaultInputShow = true;
                    this.selectTagType = false;
                    this.resetCurrentTag(true);
                    this.$emit('scrolldown');
                }
                return;
            // Use the keyboard to select the type up and down, and press the enter key.
            } else if (_.isNumber(typeIndex) && !isBlur) {
                this.typeIndex = undefined;
                if (!this.stepSelected) {
                    // Type selector
                    this.selectTagTypeFunc({
                        value: this.tagTypes[typeIndex].type,
                    });
                } else {
                    // Value type selector
                    this.stepDataSelectFunc({
                        value: this.stepSelected,
                    });
                    this.stepSelected = undefined;
                    this.addTag(false);
                }
                return;
            // Other out-of-focus situations
            } else if (isBlur) {
                util.autoDeleteSelected.call(this);
                this.updateStatus(false);
                this.resetCurrentTag(false);
                this.clearSelectingTagType();
                this.$emit('blurTag');
            } else if (!isBlur) {
                this.current.value = (this.current.value || '').trim().replace(/[\r\n]/, '');
            }
            if (isBlur) {
                this.info.focusInput = false;
            }
        },
        tagAdd(tag) {
            Object.assign(tag, {
                edit: false,
                selecting: false,
            });
            this.$emit('add', {
                value: tag,
            });
        },
        clearInput($event) {
            $event.stopPropagation();
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
                this.current = this.defaultCurrent();
                this.getCheck();
            };
            const resetValue = () => {
                const lastIndex = current.values.length - 1;
                if (lastIndex >= 0) {
                    this.updateSelected(current.type, current.values[lastIndex], lastIndex, true);
                    current.values.length = lastIndex;
                }
                current.value = current.show();
                this.getCheck();
            };
            // debugger;
            // There is currently no value entered
            if (!inputShow) {
                if (stepData) {
                    resetCurrent();
                } else if (!current.isEmpty) {
                    current.isEmpty = true;
                } else {
                    if (current.values.length) {
                        resetValue();
                    } else {
                        this.selectTagType = false;
                        this.$emit('blurTag', {
                            selectLast: true,
                        });
                    }
                }
            } else {
                if (current.values.length) {
                    if (isTrueSub()) {
                        resetValue();
                    }
                } else {
                    if (isTrueSub()) {
                        resetCurrent();
                        this.updateStatus(true);
                    }
                }
            }
        },

        // Select type using keyboard
        selectingTagType(arrow, $event) {
            const current = this.current;
            let currentData;
            if (current.datas && !this.showType) {
                currentData = current.datas[current.values.length];
            }
            if (currentData && currentData.type === 'select' || this.showType) {
                if (this.showType) {
                    this.stepSelectingTagType($event, arrow, true);
                } else {
                    this.stepSelectingTagType($event, arrow);
                }
            }

        },
        // Selected type
        selectTagTypeFunc($event) {
            // Only pressing up and down on the keyboard will have a value. When a value is selected, the value will be set to empty.
            this.typeIndex = undefined;
            const type = $event.value;
            if (!type) {
                this.stop($event.event);
                return;
            }
            this.selectTagType = true;
            const selectTagType = this.tagTypes.filter(item => item.type === type)[0];
            this.current = Object.assign(this.defaultCurrent(), selectTagType);
            this.current.isEmpty = true;
            this.current.value = this.current.show();
            this.updateStatus(true);
            this.getCheck();
            $event.event && $event.event.preventDefault();
        },
        foucsInput() {
            this.$emit('inputfocus');
        },
    },
};
</script>

