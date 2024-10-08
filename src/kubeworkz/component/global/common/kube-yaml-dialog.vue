<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="show"
      width="800px"
      :close-on-click-modal="false"
      @close="close"
    >
      <div
        v-if="!fullScreen"
        :class="$style.editor"
      >
        <div :class="$style.header">
          <div @click="handleChangeFullScreen">
            <i
              style="cursor: pointer"
              :class="fullScreen ? 'el-icon-close' : 'el-icon-full-screen'"
            />
          </div>
        </div>
        <qz-editor
          ref="yamlEdit"
          style="border: 1px solid #E1E8ED"
          :value="yamlContent"
          theme="vs"
          language="yaml"
          @change="handleEditorChange"
        />
      </div>
      <div
        v-if="yamlErrorTip"
        :class="$style.messageBox"
      >
        {{ yamlErrorTip }}
      </div>
      <!-- <div>
        <u-submit-button
          v-if="!readOnly"
          :click="submit.bind(this)"
          place="middle"
          :message="yamlErrorTip"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button @click="close">
                Cancel
              </u-button>
              <u-button
                color="primary"
                :disabled="!!yamlErrorTip || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                OK
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </div> -->
      <div
        v-if="!readOnly"
        slot="footer"
      >
        <el-button @click="close">
          Cancel
        </el-button>
        <el-button
          :disabled="!!yamlErrorTip"
          type="primary"
          :loading="commitLoading"
          @click="submit"
        >
          OK
        </el-button>
      </div>
    </el-dialog>
    <div
      v-if="fullScreen"
      :class="$style.fullScreenEditor"
    >
      <div :class="$style.header">
        <div @click="handleChangeFullScreen">
          <i
            style="cursor: pointer"
            :class="fullScreen ? 'el-icon-close' : 'el-icon-full-screen'"
          />
        </div>
      </div>
      <qz-editor
        ref="yamlEdit"
        style="border: 1px solid #E1E8ED"
        :value="yamlContent"
        theme="vs"
        language="yaml"
        @change="handleEditorChange"
      />
    </div>
  </div>
</template>

<script>
import { Modal } from '@micro-app/common/mixins';
import yamljs from 'yamljs';
import YAML from 'yaml';
import { get as getFunc } from 'lodash';
export default {
    mixins: [ Modal ],
    data() {
        return {
            title: '',
            option: {},
            yamlErrorTip: '',
            readOnly: false,
            yamlContent: '',
            fullScreen: false,
            commitLoading: false,
        };
    },
    destroyed() {
        this.validateTimeoutId && clearTimeout(this.validateTimeoutId);
    },
    methods: {
        handleChangeFullScreen() {
            console.log('handleChangeFullScreen');
            this.fullScreen = !this.fullScreen;
        },
        handleEditorChange(value) {
            if (this.validateTimeoutId) {
                clearTimeout(this.validateTimeoutId);
                this.validateTimeoutId = null;
            }
            this.validateTimeoutId = window.setTimeout(() => {
                this.yamlContent = value;
                try {
                // reset
                    this.yamlErrorTip = '';
                    yamljs.parse(value);
                } catch (err) {
                    // Second verification
                    try {
                        YAML.parse(value);
                    } catch (e) {
                        const { parsedLine, snippet } = err;
                        this.yamlErrorTip = `No ${parsedLine} Line parsing error: "${snippet}"`;
                    }
                }
            }, 300);
        },
        open(option) {
            const {
                title,
                content,
                editorOption = {},
                onSubmit,
            } = option;
            this.title = title;
            this.onSubmit = onSubmit || (() => null);
            this.yamlContent = typeof content === 'string' ? content : YAML.stringify(content);
            const editorOp = Object.assign({ readOnly: false }, editorOption);
            // this.readOnly = editorOp.readOnly;
            this.show = true;
        },
        async submit() {
            this.commitLoading = true;
            this.yamlErrorTip = '';
            let content = this.yamlContent;
            // try {
            content = YAML.parse(content);
            // } catch (err) {
            //     const { parsedLine, snippet } = err;
            //     throw new Error(`No ${parsedLine} Line parsing error: "${snippet}"`);
            // }
            try {
                await this.onSubmit(content);
                this.close();
            } catch (err) {
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.commitLoading = false;
        },
    },
};
</script>

<style module>
.messageBox {
  font-size: 12px;
  color: #f54545;
}
.editor{
  position: relative;
  padding-top: 30px;
  height: 60vh;
  margin-bottom: 20px;
}
.editor .header{
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  background: #F5F7FA;
  display: flex;
  padding: 8px;
  justify-content: flex-end
}
.fullScreenEditor {
  padding-top: 30px;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10000;
}
.fullScreenEditor .header{
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  background: #F5F7FA;
  display: flex;
  padding: 8px;
  justify-content: flex-end;
}
</style>
