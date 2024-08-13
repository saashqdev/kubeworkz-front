<template>
  <u-form-table
    ref="formTable"
    :class="$style.root"
    :size="size"
    :dynamic="true"
    @add="add"
    @change="onChange"
    @validate="valid = $event.valid"
  >
    <thead>
      <tr>
        <th
          :class="$style.th"
          :size="size"
        >
          Key
          <u-note size="large">
            <div>Key is divided into prefix and suffix, separated by /, you can write only the suffix.</div>
            <div>Prefix: 0-253 lowercase letters, numbers, "-", ".", starting and ending with letters or numbers, "." must be preceded by letters or numbers.</div>
            <div>Suffix: 1-63 letters, numbers, "-", "_" or ".", starting and ending with letters or numbers.</div>
          </u-note>
        </th>
        <th
          :class="$style.th"
          :size="size"
        >
          Value
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        is="u-form-table-tr"
        v-for="item in sortExtraList"
        :key="item.key"
        disabled
        ignore
      >
        <td>
          <u-input
            disabled
            size="huge"
            :value="item.key"
          />
        </td>
        <td>
          <u-input
            disabled
            size="huge"
            :value="item.value"
            :placeholder="valuePlaceholder"
            maxlength-message="Must not exceed 63 characters"
            maxlength="63"
          />
        </td>
      </tr>
      <tr
        is="u-form-table-tr"
        v-for="(item, index) in sortList"
        :key="index"
        :rules="rules"
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
          <u-input
            v-model="item.value"
            size="huge"
            name="value"
            :placeholder="valuePlaceholder"
            :title="valuePlaceholder"
            maxlength-message="Must not exceed 63 characters"
            maxlength="63"
          />
        </td>
      </tr>
    </tbody>
  </u-form-table>
</template>

<style module>
.root[size='large'] {
    width: 750px;
}
.th {
    width: 270px;
}
.th[size="large"] {
    width: 355px;
}
</style>

<script>
import { Inputs } from '@micro-app/common/base/mixins';
import { ignoredKeys } from '@micro-app/common/views/ncs/utils/filters';

export default {
    name: 'UInputsLabel',
    mixins: [ Inputs ],
    props: {
        size: { type: String, default: 'normal' },
        extraList: { type: [ Array, Object ], default: () => ({}) },
        canSetSpecialName: { type: Boolean, default: false }, // Is it possible to set the system label?
    },
    data() {
        const validPattern = /^(([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+\/)?(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;
        const keyRules = [
            { type: 'string', trigger: 'input+blur', pattern: /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/, message: '' },
            { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => {
                ignoredKeys.some(item => value.startsWith(item)) ? callback(new Error()) : callback();
            } },
            { type: 'string', trigger: 'blur', message: 'Cannot use system tags', validator: (rule, value, callback) => {
                ignoredKeys.some(item => value.startsWith(item)) ? callback(new Error()) : callback();
            } },
            { type: 'string', trigger: 'blur', message: 'The tag selector already exists', validator: (rule, value, callback) => {
                const instance = this.sortList.filter(item => item.key).map(item => item.key).sort()
                    .find((item, index, arr) => item === arr[index + 1]);
                this.hasSame = !!instance;
                instance && instance === value ? callback(new Error()) : callback();
            } },
            { type: 'string', trigger: 'input+blur', message: '', validator: (rule, value, callback) => {
                this.sortList.some(item => !value && !item.key && item.value) ? callback(new Error()) : callback();
            } },
        ];

        // todo: remove the corresponding rule
        this.canSetSpecialName && keyRules.splice(1, 2);
        return {
            rules: {
                key: keyRules,
                value: [
                    { type: 'string', trigger: 'input+blur', pattern: validPattern, message: '' },
                ],
            },
            sortExtraList: this.normalize(this.extraList),
            valuePlaceholder: 'Composed of 1-63 letters, numbers, "-", "_" or ".", starting and ending with letters or numbers, and can be empty',
        };
    },
    methods: {
        getDefault() {
            return {
                key: '',
                value: '',
            };
        },
        // Make the Object's selectorList passed in adjust to Array
        normalize(list) {
            if (!Object.keys(list).length) { return []; }
            const sortList = [];
            if (!(list instanceof Array)) {
                Object.keys(list).forEach((item, index) => {
                    sortList[index] = {};
                    Object.assign(sortList[index], {
                        key: item,
                        value: list[item],
                    });
                });
            }
            return sortList.length ? sortList : list;
        },
        isEmpty() {
            // value can be empty
            return this.sortList.length === 1 && !this.sortList[0].key;
        },
        $getData(list) {
            const tmp = {};
            this.getLegalList(list || this.sortList).map(item => tmp[item.key] = item.value);
            return tmp;
        },
    },
};
</script>
