<template>
  <el-dialog
    :title="title"
    :width="width"
    :visible.sync="dialogVisible"
    :custom-class="$style.dialog"
    @close="handleClose"
  >
    <div :class="$style.resultWrap">
      <el-result :icon="type" />
      <div :class="$style.messageWrap">
        <div :class="$style.message">
          {{ message }}
        </div>
        <div :class="$style.subMessage">
          {{ subMessage }}
        </div>
      </div>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :loading="cancleLoading"
        @click="dialogVisible = false"
      >Cancel</el-button>
      <el-button
        type="primary"
        :loading="commitLoading"
        @click="handleOk"
      >OK</el-button>
    </span>
  </el-dialog>
</template>
<script>
import _ from 'lodash';
export default {
    data() {
        return {
            dialogVisible: false,
            type: 'warning',
            title: '',
            message: '',
            subMessage: '',
            commitLoading: false,
            cancleLoading: false,
            width: '460px',
            ok() {

            },
            cancel() {

            },
        };
    },
    methods: {
        async handleClose() {
            if (this.cancel && typeof this.cancel === 'function') {
                this.cancleLoading = true;
                try {
                    await this.cancel();
                } catch (error) {
                    this.cancleLoading = false;
                    return;
                }
                this.cancleLoading = false;
            }
            this.dialogVisible = false;
        },
        async handleOk() {
            console.log(this.ok, typeof this.ok);
            if (this.ok && typeof this.ok === 'function') {
                this.commitLoading = true;
                try {
                    await this.ok();
                } catch (error) {
                    console.log(error);
                    this.commitLoading = false;
                    return;
                }
                this.commitLoading = false;
            }
            this.dialogVisible = false;
        },
        open(obj) {
            this.dialogVisible = true;
            Object.assign(this, {
                type: _.get(obj, 'type', 'warning'),
                title: _.get(obj, 'title', ''),
                message: _.get(obj, 'message', ''),
                ok: _.get(obj, 'ok', () => {}),
                cancel: _.get(obj, 'cancel', () => {}),
                width: _.get(obj, 'width', '460px'),
                subMessage: _.get(obj, 'subMessage', ''),
            });
        },
    },


};
</script>
<style module>
.dialog {
  min-width: auto!important;;
}
.resultWrap {
  display: flex;
}
.messageWrap {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
}
.message {
  font-size: 20px;
  color: #303133;
  line-height: 1.3;
}
.subMessage {
  font-size: 14px;
  color: #666;
  line-height: 1.3;
}
</style>
