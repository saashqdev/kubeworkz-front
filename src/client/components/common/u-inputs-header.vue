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
          Name
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
        v-for="(item, index) in sortList"
        :key="index"
        :rules="rules"
        @remove="remove(index)"
      >
        <td>
          <u-input
            v-model="item.name"
            size="huge"
            name="name"
          />
        </td>
        <td>
          <u-input
            v-model="item.value"
            size="huge"
            name="value"
          />
        </td>
      </tr>
    </tbody>
  </u-form-table>
</template>

<style module>
.root[size='small'] { width: 460px; }
.root[size='large'] { width: 750px; }

.th {width: 270px;}
.th[size='small'] { width: 210px; }
.th[size="large"] { width: 355px; }
</style>

<script>
import { Inputs } from '@micro-app/common/base/mixins';

export default {
    name: 'UInputsHeader',
    mixins: [ Inputs ],
    props: {
        size: { type: String, default: 'normal' },
    },
    data() {
        return {
            rules: {
                key: [
                    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => (this.sortList.some(item => item.name && value && !item.value) ? callback(new Error()) : callback()) },
                    { type: 'string', trigger: 'blur', message: 'Value cannot be empty', validator: (rule, value, callback) => (this.sortList.some(item => item.name && value && !item.value) ? callback(new Error()) : callback()) },
                    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => (this.sortList.some(item => !item.name && !value && item.value) ? callback(new Error()) : callback()) },
                    { type: 'string', trigger: 'blur', message: 'Name cannot be empty', validator: (rule, value, callback) => (this.sortList.some(item => !item.name && !value && item.value) ? callback(new Error()) : callback()) },
                ],
                value: [
                    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => (this.sortList.some(item => !item.value && !value && item.name) ? callback(new Error()) : callback()) },
                    { type: 'string', trigger: 'blur', message: 'Value cannot be empty', validator: (rule, value, callback) => (this.sortList.some(item => !item.value && !value && item.name) ? callback(new Error()) : callback()) },
                    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => (this.sortList.some(item => item.value && value && !item.name) ? callback(new Error()) : callback()) },
                    { type: 'string', trigger: 'blur', message: 'Name cannot be empty', validator: (rule, value, callback) => (this.sortList.some(item => item.value && value && !item.name) ? callback(new Error()) : callback()) },
                ],
            },
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
        $getData() {
            return this.getLegalList();
        },
    },
};
</script>
