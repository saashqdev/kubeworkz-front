<template>
  <div :class="$style.root">
    <u-form-table
      ref="formTable"
      :dynamic="isCreate"
      @add="add"
      @change="onChange"
      @validate="valid = $event.valid"
    >
      <tbody>
        <tr
          is="u-form-table-tr"
          v-for="(item, index) in sortList"
          :key="index"
          :rules="rules"
          :can-be-empty="canBeEmpty"
          :is-empty="isEmpty.bind(this)"
          @remove="remove(index)"
        >
          <td :width="isCreate ? '540px' : '580px'">
            <u-input
              v-model="item.dir"
              size="huge full"
              name="dir"
              placeholder="Composed of letters, numbers, dashes, underlines, English periods or &quot;/&quot;, starting with &quot;/&quot; and ending with &quot;/&quot;"
            />
          </td>
        </tr>
      </tbody>
    </u-form-table>
  </div>
</template>

<style module>
.root {
    margin-top: -25px;
}

</style>


<script>
import { Inputs } from '@micro-app/common/base/mixins';

export default {
    name: 'UInputsDir',
    mixins: [ Inputs ],
    props: {
        isCreate: { type: Boolean, default: true },
        dirs: { type: Array, default: () => ([]) }, // All containers need to ensure that the dir is unique [{ dir: 'xxx' }]
    },
    data() {
        return {
            rules: {
                dir: [
                    { type: 'string', required: true, trigger: 'input+blur', ignore: true, message: '' },
                    { type: 'string', pattern: /^\//, trigger: 'input+blur', message: 'To ... beginning' },
                    { type: 'string', pattern: /^\/[\w\-\.\/]*$/, trigger: 'input+blur', message: 'Composed of letters, numbers, dashes, underlines, periods or "/"' },
                    { type: 'string', message: 'Must not contain consecutive "/"', trigger: 'input+blur', validator: (rule, value, callback) => ((value.indexOf('//') === -1) ? callback() : callback(new Error())) },
                    { type: 'string', pattern: /\/$/, trigger: 'input', message: '' },
                    { type: 'string', pattern: /\/$/, trigger: 'blur', message: 'End with "/"' },
                    { type: 'string', trigger: 'input+blur', message: 'The log directory already exists', validator: (rule, value, callback) => ((this.dirs.filter(item => item.dir === value).length > 1) ? callback(new Error()) : callback()) },
                ],
            },
            currentDirs: this.dirs,
        };
    },
    watch: {
        dirs(value) {
            this.currentDirs = value;
        },
    },
    created() {
        // The setting page log directory cannot be increased or decreased and becomes required.
        this.rules.dir[0].ignore = this.isCreate;
    },
    methods: {
        // Convert the incoming string array into an object array, because v-model cannot bind a single item of a string array
        // ['xxx', ...] => [{dir: 'xxx}, ...]
        normalize(list) {
            return list;
        },
        getDefault() {
            return {
                dir: '',
            };
        },
        $getData(list) {
            return this.getLegalList(list || this.sortList).map(item => item.dir);
        },
    },
};
</script>
