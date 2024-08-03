<template>
  <kube-dynamic-block
    v-model="model"
    style="width: 100%;"
    :data-template="getDataTemplate"
    :disabled="disabled"
  >
    <template slot="column">
      <th>
        Key
        <u-note size="large">
          <div>Key is divided into prefix and suffix, separated by /, you can write only the suffix.</div>
          <div>Prefix: 0-253 lowercase letters, numbers, "-", ".", starting and ending with letters or numbers, "." must be preceded by letters or numbers.</div>
          <div>Suffix: 1-63 letters, numbers, "-", "_" or ".", starting and ending with letters or numbers.</div>
        </u-note>
      </th>
      <th>Value</th>
    </template>
    <template slot-scope="{ model, index }">
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${prefixKey}Key-${index}`"
          :rules="{
            KeyPattern: true,
            noSystemKey: !noSystemKeyRule && !model.disabled,
            noRedundance: { list: exsitKeys }
          }"
        >
          <kube-form-item
            muted="no"
            style="width: 100%;"
            field-size="full"
            layout="none"
            :message="errors && errors[0]"
            placement="bottom"
          >
            <u-suggest
              v-if="selectKeys"
              v-model="model.key"
              size="huge"
              name="key"
              autocomplete="off"
              :data="selectKeys"
              :disabled="disabled || model.disabled"
              :color="errors && errors[0] ? 'error' : ''"
            />
            <u-input
              v-else
              v-model="model.key"
              size="huge"
              :disabled="model.disabled"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
      <td>
        <validation-provider
          v-slot="{ errors }"
          :name="`${prefixKey}Value-${index}`"
          rules="LabelValuePatten"
        >
          <kube-form-item
            muted="no"
            style="width: 100%;"
            field-size="full"
            layout="none"
            :message="errors && errors[0]"
            placement="bottom"
          >
            <u-input
              v-model="model.value"
              size="huge"
              :disabled="disabled || model.disabled"
              :color="errors && errors[0] ? 'error' : ''"
            />
          </kube-form-item>
        </validation-provider>
      </td>
    </template>
  </kube-dynamic-block>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        selectKeys: Array,
        prefixKey: {
            type: String,
            default: '',
        },
        noSystemKeyRule: {
            type: Boolean,
            default: false,
        },
        disabled: Boolean,
    },
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
                disabled: false,
            };
        },
    },
};
</script>

<style>

</style>
