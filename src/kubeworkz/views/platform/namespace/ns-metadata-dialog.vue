<template>
  <el-dialog
    title="Modify meta information"
    :visible.sync="show"
    width="940px"
    :close-on-click-modal="false"
    @close="close"
  >
    <i
      v-if="loading"
      class="el-icon-loading"
      style="font-size: 24px"
    />
    <el-form
      v-else-if="model"
      ref="form"
      :model="model"
      label-position="right"
      label-width="120px"
    >
      <el-form-item label="Label">
        <labelEditor
          v-model="model.metadata.labels"
          workload="namespace"
          prefix-key="labels"
          prefix-prop="metadata.labels"
        />
      </el-form-item>
      <el-form-item label="Annotation">
        <labelEditor
          v-model="model.metadata.annotations"
          prefix-key="annotations"
          prefix-prop="metadata.annotations"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">
        Cancel
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="submit"
      >
        OK
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import nsService from 'kubeworkz/services/namespace';
import { toPlainObject as toMetadataPlainObject, toModifyObject as toMetadataModifyObject } from 'kubeworkz/k8s-resources/metadata.js';
import labelEditor from 'kubeworkz/elComponent/label-editor.vue';
export default {
    components: {
        labelEditor,
    },
    data() {
        return {
            show: false,
            loading: true,
            model: null,
            info: null,
            submitting: false,
        };
    },
    methods: {
        close() {
            this.model = null;
            this.info = null;
            this.show = false;
        },
        async loadNamespace(info) {
            this.loading = true;
            const res = await nsService.getNamespaceInstance({
                pathParams: {
                    cluster: info.cluster,
                    name: info.namespace,
                },
            });
            const metadata = toMetadataPlainObject(res);
            this.model = {
                metadata,
            };
            this.loading = false;
        },
        open(info) {
            this.show = true;
            this.info = info;
            this.loadNamespace(info);
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            try {
                this.submitting = true;
                const res = await nsService.getNamespaceInstance({
                    pathParams: {
                        cluster: this.info.cluster,
                        name: this.info.namespace,
                    },
                });
                this.model.puresource = res;
                const metadata = toMetadataModifyObject(this.model);
                const data = this.model.puresource;
                data.metadata = metadata;
                await nsService.updatetNamespaceInstance({
                    pathParams: {
                        cluster: this.info.cluster,
                        name: this.info.namespace,
                    },
                    data,
                });
                this.show = false;
            } catch (error) {
                console.log(error);
            }
            this.submitting = false;
        },
    },
};
</script>

<style>

</style>
