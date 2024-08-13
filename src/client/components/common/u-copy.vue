<template>
  <div :class="$style.root">
    <div
      v-show="success"
      :class="$style.success"
      :placement="placement"
    >
      <u-status-icon name="success">
        <span style="color:#999">{{ successText }}</span>
      </u-status-icon>
    </div>
    <u-link
      v-show="!success"
      ref="copyBtn"
      :data-clipboard-text="message"
      :disabled="disabled"
    >
      {{ text }}
    </u-link>
  </div>
</template>
<script>
import Clipboard from 'clipboard';

export default {
    name: 'UCopy',
    props: {
        message: String,
        placement: String,
        text: { type: String, default: 'Copy' },
        successText: { type: String, default: 'Copied' },
        disabled: { type: Boolean, default: false },
    },
    data() {
        return {
            success: false,
            timeoutId: undefined,
            clipboard: undefined,
        };
    },
    mounted() {
        this.clipboard = new Clipboard(this.$refs.copyBtn.$el).on('success', e => {
            this.success = true;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.success = false;
            }, 3000);
        });
    },
    destroyed() {
        clearTimeout(this.timeoutId);
    },
};
</script>
<style module>
.root{
    display: inline-block;
    position: relative;
}
.success{
    position: absolute;
    top: -21px;
    width: 100px;
    left: -33px;
}
.success[placement="right"]{
    position: absolute;
    top: -12px;
    width: 100px;
    left: 35px;
}
</style>
