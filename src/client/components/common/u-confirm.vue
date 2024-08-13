<template>
  <u-modal
    :class="$style.root"
    :visible.sync="show"
    :title="title"
    size="auto"
    @close="close"
  >
    <u-status-icon
      :class="$style.status"
      :name="type"
      :has-sub="hasSub"
    />
    <div
      :class="$style.text"
      :hasSub="hasSub"
    >
      <div :class="$style.content">
        {{ content }}
      </div>
      <div
        v-if="subContent"
        :class="$style.subContent"
      >
        {{ subContent }}
      </div>
      <div
        v-if="subContentHtml"
        :class="$style.subContentHtml"
        v-html="subContentHtml"
      />
    </div>
    <div
      slot="foot"
      style="position: relative;"
    >
      <span
        v-if="(message || errMsg)"
        :class="['f-toe', $style.error]"
        :title="(message || errMsg)"
      >{{ (message || errMsg) }}</span>
      <u-linear-layout>
        <u-button
          :color="isCancelPrimary ? '' : 'primary'"
          :disabled="submitting"
          :icon="submitting ? 'loading' : ''"
          @click="submit"
        >
          {{ okText }}
        </u-button>
        <u-button
          v-show="showCancel"
          :color="isCancelPrimary ? 'primary' : ''"
          @click="close"
        >
          {{ cancelText }}
        </u-button>
      </u-linear-layout>
    </div>
  </u-modal>
</template>
<style module>
.root[class] {
    /* The z-index of the drop-down box is too large, 1065, and the z-index of u-modal is originally 1000. */
    z-index: 1111;
}
.status {vertical-align: middle; display: inline-block;}
.status[hasSub = true] {vertical-align: top}
.status span{font-size: 40px !important;}

.text {
    display: inline-block;
    max-width: 360px;
    text-align: left;
    vertical-align: middle;
    word-break: break-all;
}

.text[hasSub = true] {vertical-align: top;}

.content{
    line-height: 24px;
    font-size: 20px;
    color: #333;
    text-align: left;
}

.subContent{
    line-height: 24px;
    font-size: 14px;
    color: #666;
    margin-top: 10px;
}

.subContentHtml {
    margin: 20px 0 0 -50px;
    word-break: break-all;
    max-height: 200px;
    overflow: scroll;
}

.submit {
    margin-left: -40px;
    margin-top: 20px;
    min-width: 0 !important;
}

.error {
    position: absolute;
    display: inline-block;
    height: 20px;
    overflow: hidden;
    top: -23px;
    left: 0px;
    font-size: 12px;
    color: #ff867f;
    width: 100%;
}
</style>
<script>
import { Modal } from '@micro-app/common/base/mixins';

export default {
    name: 'UConfirm',
    mixins: [ Modal ],
    props: {

    },
    data() {
        return {
            type: 'warning',
            title: 'Hint',
            content: '',
            subContent: '',
            subContentHtml: '',
            isCancelPrimary: true,
            showCancel: true, // Show cancel button by default
            ok: null,
            cancel: null,
            clickWrap: this.submit,
            submitting: false,
            errMsg: '',
            okText: 'OK',
            cancelText: 'Cancel',
            message: '',
        };
    },
    computed: {
        hasSub() {
            return !!this.subContent;
        },
    },
    watch: {
        show(val) {
            if (!val) {
                this.errMsg = '';
                this.message = '';
            }
        },
    },
    created() {
    },
    methods: {
        open(options) {
            this.show = true;
            Object.assign(this, options);
        },
        // Override mixins - close in modal
        close() {
            this.cancel && this.cancel();
            this.show = false;
        },
        submit() {
            if (this.submitting) {
                return;
            }
            this.submitting = true;
            this.errMsg = '';
            this.ok().then(data => {
                this.submitting = false;
                this.show = false;
                return data;
            }, err => {
                // todo： Error message copy display
                this.submitting = false;
                if (Array.isArray(err)) {
                    this.errMsg = (err.filter(item => item.msg)[0] || {}).msg;
                } else {
                    this.errMsg = err.message || err.Message || err.reason;
                }
            });
        },
    },
};
</script>
