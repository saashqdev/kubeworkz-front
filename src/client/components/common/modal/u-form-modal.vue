<template>
  <u-modal
    :title="title"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    v-bind="$attrs"
    @close="close"
  >
    <slot name="header" />
    <u-form
      ref="form"
      gap="large"
      layout="block"
      @validate="formCanSubmit = $event.valid"
    >
      <slot />
      <u-submit-button
        :click="submitInner.bind(this)"
        :auto-focus="true"
        place="middle"
      >
        <template slot-scope="scope">
          <slot
            name="buttons"
            :submitting="scope.submitting"
            :submit="scope.submit"
          >
            <u-linear-layout>
              <slot
                name="button"
                :submit="scope.clickWrap"
                :submitting="scope.submitting"
                :errMsg="scope.errMsg"
              />
              <u-button
                color="primary"
                :disabled="scope.submitting || !canSubmit"
                :icon="scope.submitting?'loading':null "
                @click="scope.submit"
              >
                {{ okTitle }}
              </u-button>
              <u-button
                :disabled="cancelDisabled"
                @click="close"
              >
                {{ cancelTitle }}
              </u-button>
            </u-linear-layout>
          </slot>
        </template>
      </u-submit-button>
    </u-form>
  </u-modal>
</template>

<style module>
</style>

<script>
export default {
    name: 'UFormModal',
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        cancelDisabled: {
            type: Boolean,
            default: false,
        },
        okTitle: {
            type: String,
            default: 'Submit',
        },
        title: {
            type: String,
        },
        cancelTitle: {
            type: String,
            default: 'Cancel',
        },
        visible: {
            type: Boolean,
            default: false,
        },
        submit: {
            type: Function,
            default: () => Promise.resolve(),
        },
        cancel: {
            type: Function,
            default: () => Promise.resolve(),
        },
    },
    data() {
        return {
            formCanSubmit: false,
            show: this.visible,
        };
    },
    computed: {
        canSubmit() {
            return !this.disabled;
        },
    },
    watch: {
        visible(value) {
            this.show = value;
        },
        show(value) {
            this.$emit('update:visible', value);
        },
    },
    methods: {
        submitInner(params) {
            return this.submit(params).then(res => {
                this.show = !!res;
            });
        },
        close() {
            return this.cancel().then(res => {
                this.show = !!res;
            });
        },
    },
};
</script>
