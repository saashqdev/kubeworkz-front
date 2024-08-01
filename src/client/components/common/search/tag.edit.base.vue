<style module>
.wrap1 {
    display: inline-block;
    vertical-align: middle;
}
.wrap {
    display: inline-block;
    position: relative;
    vertical-align: top;
    font-size: 14px;
}
.wrap textarea {
    position: absolute;
    z-index: 2;
    box-sizing: content-box;
    font-size: 14px;
}
.wrap .textareaShadow {
    font-family: sans-serif;
    box-sizing: content-box;
    min-width: 160px;
    display: inline-block;
    line-height: 20px;
    min-height: 20px;
    width: auto;
    margin: 5px 0;
    padding: 0 10px;
    word-break: break-all;
    border: 1px dashed #fff;
    overflow: hidden;
    vertical-align: middle;
    visibility: hidden;
}
.wrap .textareaShadow[mutil] {
    min-width: 2em;
}
.defaultInput {
    display: inline-block;
    line-height: 20px;
    min-height: 20px;
    margin: 5px 0;
    padding: 0 10px;
    word-break: break-all;
    border: 1px dashed #fff;
    overflow: hidden;
    width: calc(100% - 22px);
    height: calc(100% - 12px);
    resize: none;
}
.defaultInput[edit] {
    min-width: 1px;
    background:#fff;
    border: 1px dashed #e1e8ed;
    border-radius: 10px;
}
</style>
<script>
import Util from './util';
import tagType from './tag.type.vue';

export default {
    components: {
        [tagType.name]: tagType,
    },
    methods: {
        focusCampo(inputField) {
            // Move the cursor to the right
            if (inputField && inputField.value && inputField.value.length !== 0) {
                if (inputField.createTextRange) {
                    const FieldRange = inputField.createTextRange();
                    FieldRange.moveStart('character', inputField.value.length);
                    FieldRange.collapse();
                    FieldRange.select();
                } else if (inputField.selectionStart || (inputField.selectionStart - 0) === 0) {
                    const elemLen = inputField.value.length;
                    inputField.selectionStart = elemLen;
                    inputField.selectionEnd = elemLen;
                    inputField.focus();
                }
            }
        },
        stopPropagation($event) {
            if ($event) {
                $event.stopPropagation();
            }
        },
        updateSelected: Util.updateSelected,
        autoDeleteSelected: Util.autoDeleteSelected,
        stepDataSelectFunc($event) {
            const value = $event.value;
            const current = this.current;
            current.values.push(value);
            current.isEmpty = true;
            current.value = current.show();
            const stepData = this.stepData;
            // The value selected by the user can be filtered out so that it does not appear in the next result, but be careful not to change the original value.
            if (stepData.uniqueFilter) {
                if (!stepData._values) {
                    stepData._values = stepData.values;
                }
                stepData.values = stepData.uniqueFilter(stepData._values, value);
            }
            if (stepData.values) {
                if (Array.isArray(stepData.values)) {
                    stepData.values.forEach((value) => {
                        value.selecting = false;
                    });
                } else {
                    Object.keys(stepData.values).forEach((value) => {
                        stepData.values[value].selecting = false;
                    });
                }
            }
            this.updateSelected(current.type, value, current.values.length - 1);
            this.selectTagType = true;
            this.getCheck();
            if (this.stepData) {
                $event.event && $event.event.preventDefault();
            }
        },
        getCheck() {
            const current = this.current;
            if (current && current.datas) {
                const stepData = this.stepData = current.datas[current.values.length];
                if (stepData && stepData.remote) {
                    if (!stepData.isCache || (stepData.isCache && !stepData.values)) {
                        stepData.remote().then((data) => {
                            this.$set(stepData, 'values', data);
                        });
                    }
                }
            } else {
                this.stepData = undefined;
            }
        },
        focusTag($event) {
            $event.stopPropagation();
            const { current, info } = this;
            const { tags } = info;
            const last = tags[tags.length - 1];
            if (!current.value && last) {
                Object.assign(last, {
                    edit: false,
                    selecting: true,
                });
                this.toggleInput(false);
            }
        },
        toggleInput(isFoucs) {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = this.$nextTick(function () {
                this.$refs && this.$refs.defalutValue && this.$refs.defalutValue[isFoucs ? 'focus' : 'blur']();
            }, 0);
        },
        updateStatus(status) {
            this.current.edit = status;
            this.current.selecting = status;
            this.toggleInput(status);
            this.info.defaultInputShow = status;
        },
        checkInput($event) {
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
            }
            this.current.isEmpty = false;
        },
        isComplete(current) {
            current.value = (current.value || '').replace(current.show(), '').trim().replace(/[\r\n]/, '');
            // Enter text and assign the default type
            if (!current.type && current.value) {
                const defaultTag = this.tagTypes[this.info.defaultTypeIndex];
                Object.assign(current, defaultTag, {
                    show: defaultTag.show,
                });
            }
            // There is a type
            if (current.type) {
                if (current.value && current.values.length < current.datas.length) {
                    current.values.push(current.value);
                }
                const pass = current.check ? current.check() : !!current.value;
                if (!pass) {
                    current.value = current.show();
                }
                return pass;
            }
            return false;
        },
        stepSelectingTagType($event, arrow, isRoot) {
            $event && $event.preventDefault();
            const tagTypes = this.getTagTypes();
            if (!tagTypes || !tagTypes.length) {
                return;
            }
            const lastIndex = tagTypes.length - 1;
            const startIndex = 0;
            let typeIndex = -1;
            let preTypeIndex = typeIndex;
            tagTypes.forEach((item, index) => {
                if (item.selecting) {
                    preTypeIndex = typeIndex = index;
                }
                item.selecting = false;
            });
            const isDisabeld = (typeIndex) => {
                if (isRoot) {
                    const cur = this.tagTypes[typeIndex];
                    return cur.unique && this.info.tags.filter((item) => cur.type === item.type).length;
                }
                const selected = this.info.selected;
                const current = this.current;
                const currentSelected = (selected[current.type] || {})[current.values.length];
                return currentSelected && tagTypes[typeIndex].unique && currentSelected.indexOf(tagTypes[typeIndex].type) !== -1;
            };
            const getNext = function (typeIndex) {
                if (typeIndex === -1) {
                    typeIndex = arrow === 'down' ? startIndex : lastIndex;
                } else if (arrow === 'down') {
                    typeIndex++;
                    if (typeIndex > lastIndex) {
                        typeIndex = startIndex;
                    }
                } else {
                    typeIndex--;
                    if (typeIndex < startIndex) {
                        typeIndex = lastIndex;
                    }
                }
                return typeIndex;
            };
            let i = 0; // counter
            typeIndex = getNext(typeIndex);
            while (isDisabeld(typeIndex)) {
                if (i === lastIndex + 1) {
                    typeIndex = -1;
                    break;
                }
                typeIndex = getNext(typeIndex);
                i++;
            }
            if (typeIndex !== -1) {
                const cur = tagTypes[typeIndex];
                cur.selecting = true;
                this.$set(tagTypes, typeIndex, cur);
                this.typeIndex = typeIndex;
                if (!isRoot) {
                    this.stepSelected = tagTypes[typeIndex].label;
                } else {
                    this.stepSelected = undefined;
                }
            } else {
                this.typeIndex = undefined;
                this.stepSelected = undefined;
            }
        },
        // Clear a type selected with the keyboard
        clearSelectingTagType() {
            const tagTypes = this.tagTypes;
            tagTypes.forEach((item) => {
                item.selecting = false;
            });
            const datas = (this.current || {}).datas;
            (datas || []).forEach((item) => {
                if (item.type === 'select') {
                    item.selecting = false;
                }
            });
        },
        getTagTypes() {
            let tagTypes = this.tagTypes;
            const stepData = this.stepData;
            if (stepData && stepData.type === 'select') {
                tagTypes = stepData.values;
            }
            if (tagTypes && !Array.isArray(tagTypes)) {
                tagTypes = Object.keys(tagTypes).map((item) => tagTypes[item]);
            }
            return tagTypes;
        },
        },
}
</script>
