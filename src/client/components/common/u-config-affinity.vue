<template>
  <div>
    <u-multi-add
      ref="multiAdd"
      :list="sortList"
      :need-init="needInit"
      :add-btn-info="addBtnInfo"
      :mini-formater="miniFormater"
      :get-default-item="getDefaultItem"
      :get-error-tip="getErrorTip"
      size="affinity"
      @change="changeInputList"
    >
      <div slot-scope="props">
        <u-inputs-affinity-rule
          :list="props.item.rules"
          :type="props.item.type"
          :operators="props.item.operators"
          :can-be-empty="!needInit"
          @validate="validateItem($event, props.item)"
          @change="props.item.rules = $event.value"
        />
      </div>
    </u-multi-add>
  </div>
</template>
<style module>

</style>
<script>

import { cloneDeep, throttle } from 'lodash';

export default {
    name: 'UConfigAffinity',
    props: {
        isHostNetworkSupport: { type: Boolean, default: false },
        list: [ Array, Object ],
        type: { type: String, default: 'nodeAffinity' }, // nodeAffinity || podAffinity || podAntiAffinity
    },
    data() {
        return {
            sortList: this.initList(this.list),
            addBtnInfo: {
                text: 'Add rule',
                disabledAdd: false, // i.e. no limit on quantity
            },
        };
    },
    computed: {
        needInit() {
            return this.isHostNetworkSupport && [ 'nodeAffinity', 'podAntiAffinity' ].includes(this.type);
        },
    },
    watch: {
        needInit(val) {
            if (val) {
                this.$refs.multiAdd.init();
            }
        },
    },
    created() {
        this.validate = throttle(this.validate, 500);
    },
    methods: {
        /** * Some functions needed by u-multi-add.vue ***/
        getDefaultItem() {
            return {
                type: this.type,
                rules: [],
                operators: this.getOperators(),
            };
        },
        miniFormater(item, index) {
            return 'Rule' + (index + 1);
        },
        getErrorTip() {
            return '';
        },
        // Only when the list is collapsed, expanded, added or deleted will it be verified.
        changeInputList(event) {
            this.sortList = event.list;
            this.validate();
        },
        /** * Some functions needed by u-multi-add.vue ***/
        // list is an object
        initList(list = {}) {
            const tmp = this.type === 'nodeAffinity'
                ? (list.requiredDuringSchedulingIgnoredDuringExecution || {}).nodeSelectorTerms
                : list.requiredDuringSchedulingIgnoredDuringExecution;
            return (tmp || []).map(item => {
                const expressions = this.type === 'nodeAffinity' ? item.matchExpressions : item.labelSelector.matchExpressions;
                return {
                    type: this.type,
                    operators: this.getOperators(),
                    rules: expressions,
                };
            });
        },
        getOperators() {
            // Exists || DoesNotExist is not followed by values
            const operators = [ 'In', 'NotIn', 'Exists', 'DoesNotExist', 'Gt', 'Lt' ];
            return this.type === 'nodeAffinity' ? operators : operators.slice(0, -2);
        },
        validateItem(event, item) {
            item.valid = event.valid;
            this.validate();
        },
        // overall verification
        validate(event, item) {
            // sortList can be empty
            const valid = !this.sortList.length || this.sortList.some(item => item.valid);
            this.$emit('validate', { valid });
        },
        $getData() {
            // Among the u-config-affinity components, basically only the u-inputs-affinity-rule component needs to pass values, so there is no need to call the $getData method to filter legal values.
            // Only the sortList items with empty rules need to be filtered out
            const expressions = this.sortList.filter(item => item.rules.some(item => item.key)).map(item => ({
                matchExpressions: item.rules.map(item => ({
                    key: item.key,
                    operator: item.operator,
                    values: [ 'Exists', 'DoesNotExist' ].includes(item.operator) ? undefined : item.values.trim().split(/\s+/),
                })),
            }));
            if (this.type === 'nodeAffinity') {
                return expressions;
            } return expressions.map(item => ({
                labelSelector: item,
                topologyKey: 'kubernetes.io/hostname',
            }));
        },
    },
};
</script>
