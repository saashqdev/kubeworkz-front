<template>
  <u-form-table
    ref="formTable"
    :dynamic="dynamic"
    @add="add"
    @change="onChange"
    @validate="valid = $event.valid"
  >
    <thead>
      <tr>
        <th width="220px">
          Key
        </th>
        <th width="100px">
          Operator
        </th>
        <th width="220px">
          Values
        </th>
      </tr>
    </thead>
    <tbody>
      <!-- The valid detection inside the component is not thrown to the whole world because there is a switch when using it. If there are more scenarios for subsequent use, the global parameters will be exposed -->
      <tr
        is="u-form-table-tr"
        v-for="(item, index) in sortList"
        :key="index"
        :rules="rules"
        :global="false"
        :can-be-empty="canBeEmpty"
        :is-empty="isEmpty.bind(this)"
        @remove="remove(index)"
      >
        <td>
          <u-input
            v-model="item.key"
            size="huge"
            name="key"
          />
        </td>
        <td>
          <u-select
            v-model="item.operator"
            size="huge"
            :data="sortOperators"
            @select="onSelect($event, item)"
          />
        </td>
        <td v-if="item.hasValue">
          <u-input
            key="value"
            v-model="item.values"
            size="huge"
            name="values"
            :placeholder="item.operator | getPlaceholder"
          />
        </td>
        <td v-else>
          <u-input
            key="none"
            disabled
            size="huge"
            value="No need to fill in values"
          />
        </td>
      </tr>
    </tbody>
  </u-form-table>
</template>

<script>
import { Inputs } from '@micro-app/common/base/mixins';

export default {
    name: 'UInputsAffinityRule',
    filters: {
        getPlaceholder(operator) {
            return [ 'In', 'NotIn' ].includes(operator) ? 'Multiple values ​​can be entered, separated by spaces.' : 'Please enter an integer value';
        },
    },
    mixins: [ Inputs ],
    props: {
        disabled: { type: Boolean, default: false },
        operators: Array,
        // type: { type: String, default: 'nodeAffinity' },
    },
    data() {
        const keyReg = /(?=^([^/]{1,253}[/])?[^/]{1,63}$)([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*[/])?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]/;
        const valueReg = /(?=^.{1,63}$)[a-z0-9A-Z]([a-z0-9A-Z-_.]*[a-z0-9A-Z])?/;
        return {
            dynamic: !this.disabled,
            rules: {
                key: [
                    { type: 'string', pattern: keyReg, trigger: 'input+blur', message: '' },
                    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => {
                        const instance = this.sortList.filter(item => item.key).map(item => item.key).sort()
                            .find((item, index, arr) => item === arr[index + 1]);
                        this.hasSame = !!instance;
                        instance && instance === value ? callback(new Error()) : callback();
                    } },
                    { type: 'string', trigger: 'blur', message: 'The key already exists', validator: (rule, value, callback) => {
                        const instance = this.sortList.filter(item => item.key).map(item => item.key).sort()
                            .find((item, index, arr) => item === arr[index + 1]);
                        this.hasSame = !!instance;
                        instance && instance === value ? callback(new Error()) : callback();
                    } },
                    { type: 'string', trigger: 'input+blur', message: '', validator: (rule, value, callback) => {
                        this.sortList.some(item => !value && !item.key && item.values) ? callback(new Error()) : callback();
                    } },
                ],
                values: [
                    { type: 'string', trigger: 'input+blur', message: '', validator: (rule, value, callback) => {
                        const values = value ? value.trim().split(/\s+/) : [];
                        const { key, operator } = this.sortList.find(item => item.values === value);
                        if (!key || [ 'Exists', 'DoesNotExist' ].includes(operator)) { callback(); } else if ([ 'In', 'NotIn' ].includes(operator)) { (values.length && values.every(item => valueReg.test(item))) ? callback() : callback(new Error()); } else { (values.length === 1 && valueReg.test(values[0])) ? callback() : callback(new Error()); }
                    } },
                ],
            },
            sortOperators: this.operators.map(item => ({ text: item, value: item })),
        };
    },
    methods: {
        onSelect(event, item) {
            item.hasValue = ![ 'Exists', 'DoesNotExist' ].includes(event.value);
        },
        getDefault() {
            return {
                key: '',
                operator: this.operators[0],
                values: '',
                hasValue: true,
            };
        },
        normalize(list) {
            return list.map(item => Object.assign({}, item, {
                values: item.values ? item.values.join(' ') : undefined,
                hasValue: ![ 'Exists', 'DoesNotExist' ].includes(item.operator),
            }));
        },
        isEmpty() {
            const { key, hasValue, values } = (this.sortList[0] || {});
            // The operator is Exists', 'DoesNotExist', and values ​​are not required
            return this.sortList.length === 1 && (hasValue ? !(key && values) : !key);
        },
        $getData() {
            return this.getLegalList().map(item => ({
                key: item.key,
                operator: item.operator,
                values: [ 'Exists', 'DoesNotExist' ].includes(item.operator) ? undefined : item.values.trim().split(/\s+/),
            }));
        },
    },
};
</script>
