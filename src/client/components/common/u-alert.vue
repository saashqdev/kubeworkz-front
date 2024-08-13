
<template>
  <u-modal
    :visible.sync="show"
    title="Hint"
    @close="close"
    @ok="onOk"
    @cancel="onCancel"
  >
    <p :class="$style.content">
      <u-status-icon
        :class="$style.status"
        :name="type"
      />{{ content }}
    </p>
    <p :class="$style.des">
      {{ description }}
    </p>
  </u-modal>
</template>

<style module>
.status span{
    font-size: 40px !important;
}
.content{
    line-height: 24px;
    font-size: 20px;
    color: #333;
    text-align: center;
}
.des{
    line-height: 24px;
    font-size: 14px;
    color: #666;
    margin-top: 10px;
}
</style>

<script>
import { Modal } from '@micro-app/common/base/mixins/index.js';

export default {
    name: 'UAlert',
    mixins: [ Modal ],
    data() {
        return {
            modalVisible: false,
            ok: () => {},
            cancel: () => {},
            title: 'Hint',
            content: '',
            type: 'warning',
            description: '',
        };
    },
    methods: {
        open(options) {
            this.show = true;
            Object.assign(this, options);
        },
        onOk() {
            this.ok();
        },
        onCancel() {
            this.cancel();
        },
    },
};
</script>
