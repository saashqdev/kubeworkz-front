<template>
  <u-modal :visible.sync="showErrorModal" :style="{zIndex: 9999}" mask-close title="Error message" okButton="" cancelButton="" size="large">
      <u-form v-if="errorMsg" gap="small" label-size="auto">
        <u-form-item label="Reason:" layout="block" label-size="small">
          <u-text :class="$style.textFile" color="error">{{errorMsg.reason || 'error'}}</u-text>
        </u-form-item>
        <u-form-item v-if="errorMsg.field" label="Fields:" layout="block" label-size="small">
          <u-text :class="$style.textFile" color="error">{{errorMsg.field}}</u-text>
        </u-form-item>
        <u-form-item v-if="errorMsg.message" label="Details:" layout="block" label-size="small">
          <u-text :class="$style.textFile" color="error" v-html="errorMsg.message"/>
        </u-form-item>
      </u-form>
  </u-modal>
</template>
<script>
export default {
    name: 'u-global-error-modal',
    data() {
        return {
            showErrorModal: false,
            errorMsg: null,
        };
    },
    methods: {
        open(errorMsg) {
            this.showErrorModal = true;
            if (errorMsg.message) {
                errorMsg = { ...errorMsg };
                if (typeof errorMsg.message === 'string') {
                    errorMsg.message = errorMsg.message.split('\n').join('<br/>');
                }
            }
            this.errorMsg = errorMsg;
        },
    },
};
</script>
<style module>
.textFile{
  word-break: break-all;
}
</style>
