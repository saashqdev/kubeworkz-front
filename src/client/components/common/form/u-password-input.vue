<template>
  <u-input
    v-model="currentValue"
    :size="size"
    :disabled="disabled"
    :class="$style.root"
    :type="show ? 'text' : 'password'"
    :placeholder="placeholder"
    :maxlength="maxlength"
  >
    <i :class="$style.password_icon" />
    <i
      :class="$style.reset"
      :show="!!currentValue && !disabled"
      @click="!disabled && (currentValue = '')"
    />
    <i
      :class="$style.eye"
      :disabled="disabled"
      :show="show"
      @click="!disabled && (show = !show)"
    />
  </u-input>
</template>
<style module>
.root[class]{
    padding: 0 30px !important;
}
.password_icon:before{
    position: absolute;
    left: 8px;
    color: #ccc;
    font-size: 16px;
    icon-font: url(@micro-app/common/assets/permission.svg);
}
.reset, .eye { cursor: pointer; }
.reset[disabled], .eye[disabled] { cursor: not-allowed; }
.reset { display: none; }
.reset[show=true] { display: inline; }
.reset:before {
    position: absolute;
    right: 25px;
    icon-font: url(@micro-app/common/assets/delete.svg);
    color: #ccc;
    font-size: 16px;
}

.eye:before {
    position: absolute;
    font-size: 18px;
    icon-font: url(@micro-app/common/assets/eyeclose.svg);
    right: 5px;
    color: #ccc;
}
.eye[show=true]:before { icon-font: url(@micro-app/common/assets/eye.svg); }
</style>
<script>

import { mapComponents } from '@micro-app/common/utils';
import { service } from '@micro-app/common/views/ncs/services';

export default {
    name: 'UPasswordInput',
    components: mapComponents([]),
    props: {
        value: String,
        size: { type: String, default: 'auto' },
        maxlength: { type: String, default: '128' },
        placeholder: { type: String, default: 'Please enter password' },
        disabled: { type: Boolean, default: false },
    },
    data() {
        return {
            show: false, // Whether to hide password
            currentValue: this.value,
        };
    },
    computed: {

    },
    watch: {
        currentValue(value) {
            this.$emit('update:value', value);
            this.$emit('input', value);
        },
    },
    created() {

    },
    methods: {
    },
};
</script>
