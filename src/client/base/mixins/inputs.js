import { isEqual, cloneDeep } from 'lodash';
import Vue from 'vue';
/**
 * Dynamically add multiple items (the content of each item [drop-down box, input, etc.] is variable, and the number is variable)
 * Functions need to be implemented: getDefault [get the default object], normalize [initialize the incoming object], $getData [get the customized value (interface required)]
 * Functions that can be used: remove [delete an item], getLegalList [get legal list values], etc.
 * props: list [multiple data passed in by the parent component], canBeEmpty [whether illegal items are allowed], etc.
 * Variables: sortList [list items that conform to the internal data structure], hasSame [whether there are duplicates], valid [whether the internal data of the current u-inpus-xxx.vue component is legal], states [whether each item is legal data]
 * Example: u-inputs-label.vue, u-inputs-env.vue
 */
export default {
    props: {
        readonly: Boolean,
        disabled: Boolean,
        // There will be problems if the data passed in by the parent component is directly converted.
        list: { type: [ Array, Object ], default: () => [] },
        needSortValue: { type: Boolean, default: false },
        canBeEmpty: { type: Boolean, default: true }, // Whether the value can be empty (no legal value)
        needCompare: { type: Boolean, default: false }, // [todo] Do you need to compare data changes?
        global: { type: Boolean, default: true }, // Whether to synchronize the internal verification of the inputs component to its nearest u-form [its own verification will not be affected], see usage:u-inputs-affinity-rule.vue
        needInit: { type: Boolean, default: true }, // Whether to initialize an item
        // Usage tips: Because it will only be synchronized to its latest u-form, it can also play an isolation role by wrapping an additional u-form without actual validation.
    },
    data() {
        return {
            sortList: [],
            legalList: [],
            hasSame: false, // Are there duplicates?
            states: [], // The state of each item in the current sortList
            valid: false, // current u-inputs-XX.vue Is the internal data of the component legal?
            timeId: null,

            loadBeforeCreated: true, // Whether the list value is passed in from the outside world
        };
    },
    // The process of clicking to collapse and then expand will reinitialize the current component, and the intermediate value saved by u-containers-config exactly matches the sortList. Cannot go through this.normalize process
    // enhancement: Modified v-if -> v-show of u-multi-add.vue component. Collapse and expansion will no longer reset internal components.
    // That is: u-inputs will only be created once, no judgment is required. Expand Collapse || Initialization Distinction
    created() {
        if (!this.loadBeforeCreated) { return; }
        if (!this.normalize) { console.error('error: Please define the normalize function in the component'); }
        if (!this.getDefault) { console.error('error: Please define the getDefault function within the component'); }
        // The intermediate value saved by u-containers-config must be an array (the initial value when setting may be an object)
        // const keys = Object.keys((this.list.length && this.list[0]) || {});
        // Do not place this.defaults inside the data() function, because the variables used inside the function may also be initialized in the data phase. Will cause unexpected errors
        this.defaults = (this.getDefault && this.getDefault()) || {};
        // const defaultKeys = Object.keys(this.defaults);
        // The intermediate value saved by u-containers-config && is separated by setting page initialization
        // todo: There is no need for the logical branch cloneDeep in the future.
        // if(keys.length === defaultKeys.length && keys.every((item) => defaultKeys.includes(item)))
        //     this.sortList = cloneDeep(this.list);
        // else
        this.initialize(this.list);
    },
    destroyed() {
        this.timeId && clearTimeout(this.timeId);
    },
    methods: {
        initialize(list) {
            if (list.length || Object.keys(list).length) { this.sortList = this.normalize(list); } else if (this.needInit) { this.add(); }
        },
        add() {
            this.sortList.push(this.getDefault());
        },
        remove(index) {
            const isError = this.states[index] === 'error';
            this.$nextTick(() => {
                // Delete duplicate items || Error items need to be fully validated
                (this.hasSame || isError) && this.$refs.formTable && this.$refs.formTable.validate();
            });
            if (this.sortList.length === 1 && this.needInit) {
                Vue.set(this.sortList, 0, this.getDefault(true));
                Vue.set(this.states, 0, '');
                // this.$nextTick is not used here but setTimeout is because the data update is mainly reflected in u-form-table-tr, and this.$nextTick cannot be sensed.
                this.timeId = setTimeout(() => this.$refs.formTable && this.$refs.formTable.validate());
            } else {
                this.sortList.splice(index, 1);
                this.states.splice(index, 1);
            }

            // In a specific component, after the remove function is executed, it can be executed again. (Mainly because the remove function is more complex, such as the add method, which can be directly overridden)
            this.afterRemove && this.afterRemove(index);
            this.onChange(this.states);
        },
        onChange(states) {
            this.states = states;
            this.$emit('validate', { valid: this.valid });
            // sortValue is a processed data model that meets the requirements of the back-end interface. The acquisition process needs to be compared with this.defaults, which is relatively performance-intensive.
            // Controlled by needSortValue, turned off by default
            this.$emit('change', this.needSortValue ? {
                sortValue: this.$getData(),
                value: this.sortList,
            } : {
                value: this.sortList,
            });
        },
        // Under normal circumstances, the default item is empty, the component does not report an error, and the parameters required by the interface need to filter out these items.
        // However, in some special cases, the default item is legal. At this time, you need to specifically specify that the isDefaultTrue parameter is true.
        getLegalList(list, isDefaultTrue = false) {
            const tmp = list || this.sortList;
            return isDefaultTrue ? tmp : tmp.filter(item => !isEqual(item, this.defaults));
        },
        $reset() {
            this.states = [];
            this.sortList = [ this.getDefault(true) ];
        },
        /**
         * Valid when the value of canBeEmpty is false, determine whether the only item left in this.sortList is an invalid value. If it is invalid, an illegal valid result is thrown to u-form.
         *
         * inputs only implements a general logical judgment here, that is, when this.sortList[0] has an empty attribute, it will judge that the current value is invalid.
         * If you need to implement customized logic in the u-inputs-xx component, you can directly override this method.
         *
         * @return {Boolean} - Is it an invalid value?
         */
        isEmpty() {
            return this.sortList.length === 1 && Object.values(this.sortList[0]).some(value => !value);
        },
    },
};
