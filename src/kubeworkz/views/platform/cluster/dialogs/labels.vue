<template>
  <el-dialog
    title="Edit tag"
    :visible.sync="show"
    width="640px"
    @close="close"
  >
    <el-form
      v-if="show"
      ref="form"
      :model="model"
      label-position="right"
    >
      <el-form-item>
        <labelEditor
          v-model="model.labels"
          prefix-key="labels"
          prefix-prop="labels"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">
        Cancel
      </el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        @click="submit"
      >
        OK
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { get, cloneDeep, set } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubeworkz/services/k8s-resource';
import labelEditor from 'kubeworkz/elComponent/label-editor.vue';
import { ignoredKeys } from 'kubeworkz';
export default {
    components: {
        labelEditor,
    },
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            model: {
                labels: [],
            },
            raw: null,
            submitLoading: false,
        };
    },
    methods: {
        open(item) {
            console.log(item);
            const labels = get(item, 'metadata.labels', []);
            this.model.labels = labels.map(i => ({
                ...i,
                disabled: ignoredKeys.some(k => i.key.startsWith(k)),
            }));

            this.raw = cloneDeep(item);
            this.show = true;
        },
        async submit() {
            // Trigger verification
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.submitLoading = true;
            try {
                const data = await workloadService.getResourceWithoutNamespace({
                    pathParams: {
                        cluster: this.instance.clusterName,
                        resource: 'nodes',
                        name: get(this.raw, 'metadata.name'),
                    },
                });
                const labels = {};
                this.model.labels.filter(l => l.key).forEach(l => {
                    labels[l.key] = l.value;
                });
                set(data, 'metadata.labels', labels);
                await workloadService.updateResourceWithoutNamespace({
                    pathParams: {
                        cluster: this.instance.clusterName,
                        resource: 'nodes',
                        name: get(this.raw, 'metadata.name'),
                    },
                    data,
                });
                this.show = false;
                this.$emit('refresh');
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style>

</style>
