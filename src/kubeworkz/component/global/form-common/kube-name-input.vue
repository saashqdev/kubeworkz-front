<template>
  <validation-provider
    v-slot="{ errors }"
    :name="name"
    :rules="combinedRules"
  >
    <kube-form-item
      :label="label"
      required
      v-bind="$attrs"
      :message="errors && errors[0]"
    >
      <slot />
      <u-input
        v-model="model"
        :disabled="disabled"
        size="normal huge"
        maxlength="63"
        maxlength-message="Must not exceed 63 characters"
        :color="errors && errors[0] ? 'error' : ''"
        placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
      />
    </kube-form-item>
  </validation-provider>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        label: {
            type: String,
            default: 'Name',
        },
        rules: {
            type: Object,
            default: () => ({}),
        },
        name: {
            type: String,
            default: 'Name',
        },
        disabled: Boolean,
    },
    computed: {
        combinedRules() {
            return Object.assign({}, {
                required: true,
                startsWithLowercaseLetter: true,
                ConsistoLetterNumbersUnderscores: true,
                endsWithLowercaseLetterOrNumber: true,
            }, this.rules);
        },
    },
};
</script>

<style>

</style>
