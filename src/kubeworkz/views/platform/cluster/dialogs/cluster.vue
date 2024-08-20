<template>
  <div>
    <el-dialog
      :title="isEdit ? 'Modify cluster': 'Add cluster'"
      :visible.sync="show"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        v-if="show && isEdit"
        ref="form"
        :model="model"
        label-position="right"
        label-width="120px"
      >
        <el-form-item
          label="Cluster name"
          prop="clusterDisplayName"
          :rules="[
            validators.required(),
            validators.clusterDisplayName(),
          ]"
        >
          <el-input
            v-model="model.clusterDisplayName"
            disabeld
            placeholder="1-100 characters, starting or ending with letters, and numbers, supporting underline and center line"
          />
        </el-form-item>
        <el-form-item
          label="Cluster ID"
          prop="clusterName"
          :rules="[
            validators.required(),
            validators.k8sResourceNameValidator(),
          ]"
        >
          <el-input
            v-model="model.clusterName"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item
          label="Description"
          prop="description"
          :rules="[
            validators.lengthBetween(0, 128)
          ]"
        >
          <el-input
            v-model="model.description"
            placeholder="Max 128 characters"
          />
        </el-form-item>
        <el-form-item
          v-if="!isEdit"
          label="KubeConfig"
          prop="kubeConfig"
          :rules="[
            validators.required(),
          ]"
        >
          <div style="display:flex">
            <el-input
              v-model="model.kubeConfig"
              style="margin-right:10px"
              disabled
            />
            <u-uploader
              style="width: 80px"
              max-size="1MB"
              @before-send="onUpload($event)"
              @error="uploadError($event)"
            >
              <el-link type="primary">
                Select a document
              </el-link>
            </u-uploader>
          </div>
        </el-form-item>
        <el-form-item
          label="Network Type"
          prop="networkType"
          :rules="[
            validators.required(),
            validators.trimRequired(),
          ]"
        >
          <div style="display:flex">
            <el-input
              v-if="otherNetworkType"
              v-model="model.networkType"
              placeholder="Please enter"
            />
            <el-select
              v-else
              v-model="model.networkType"
              filterable
              placeholder="Please choose"
            >
              <el-option
                v-for="item in networkTypes"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
            <el-checkbox
              v-model="otherNetworkType"
              style="margin-left: 8px"
            >
              Other
            </el-checkbox>
          </div>
        </el-form-item>
      </el-form>
      <div
        v-else-if="show"
        :class="$style.noticeWrap"
      >
        <span :class="$style.textspan">
          Please refer to
        </span>
        <el-link
          type="primary"
          target="_blank"
          href="https://www.kubeworkz.io/docs/installation-guide/install-on-k8s/install-member-by-helm/#Install-warden on the compute cluster via-helm"
        >
          Documentation link
        </el-link>
        <span :class="$style.textspan">
          to manage computing clusters.
        </span>
      </div>
      <div
        v-if="isEdit"
        slot="footer"
      >
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
  </div>
</template>

<script>
import { cloneDeep, get as getFunc, set as setFunc } from 'lodash';
import { Modal } from '@micro-app/common/mixins';
import clusterService from 'kubeworkz/services/cluster.js';
import k8sResourceService from 'kubeworkz/services/k8s-resource';
import { CLUSTER_NETWORK_TYPE_MAP } from 'kubeworkz/utils/constants';
import { encode, decode } from 'js-base64';
import { validatorsMixin } from 'kubeworkz/mixins';
import { get } from 'vuex-pathify';
const getDefaultCluster = () => ({
    clusterDisplayName: '',
    clusterName: '',
    networkType: 'calico',
    description: '',
    kubeConfig: '',
});
export default {
    mixins: [ Modal, validatorsMixin ],
    props: {
        instance: Object,
    },
    data() {
        return {
            uploadErrorMsg: '',
            model: getDefaultCluster(),
            isEdit: false,
            networkTypes: Object.keys(CLUSTER_NETWORK_TYPE_MAP).map(key => ({ text: CLUSTER_NETWORK_TYPE_MAP[key].text, value: key })),
            otherNetworkType: false,
            submitLoading: false,
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
    },
    methods: {
        open(item) {
            console.log(item);
            this.model = getDefaultCluster();
            this.show = true;
            if (item) {
                Object.assign(
                    this.model,
                    {
                        clusterDisplayName: getFunc(item, 'annotations.["cluster.kubeworkz.io/cn-name"]', ''),
                        clusterName: item.clusterName,
                        description: item.clusterDescription,
                        networkType: item.networkType,
                    }
                );
                this.isEdit = true;
                this.otherNetworkType = !this.networkTypes.find(i => i.value === item.networkType);
            }
        },
        onUpload(event) {
            event.preventDefault();
            const reader = new FileReader();
            reader.readAsText(event.file);
            reader.onload = e => { this.model.kubeConfig = e.target.result; };
        },
        uploadError(e) {
            if (e.name === 'ExtensionError') {
                this.uploadErrorMsg = `Can only upload ${e.extensions.join(', ')} type of file!`;
            } else { this.uploadErrorMsg = e.message; }
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
                if (this.isEdit) {
                    const clusterYaml = await k8sResourceService.getClusterCRResourceInstance({
                        pathParams: {
                            cluster: this.controlClusterList[0].clusterName,
                            group: 'cluster.kubeworkz.io',
                            version: 'v1',
                            plural: 'clusters',
                            name: this.model.clusterName,
                        },
                    });
                    setFunc(clusterYaml, 'spec.description', this.model.description);
                    setFunc(clusterYaml, 'spec.networkType', this.model.networkType);
                    setFunc(clusterYaml, 'metadata.annotations.["cluster.kubeworkz.io/cn-name"]', this.model.clusterDisplayName);
                    await k8sResourceService.modifyClusterCRResource({
                        pathParams: {
                            cluster: this.controlClusterList[0].clusterName,
                            group: 'cluster.kubeworkz.io',
                            version: 'v1',
                            plural: 'clusters',
                            name: this.model.clusterName,
                        },
                        data: clusterYaml,
                    });
                } else {
                    const data = cloneDeep(this.model);
                    data.kubeConfig = encode(data.kubeConfig);
                    await clusterService.addCluster({
                        data,
                    });
                }
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

<style module>
.noticeWrap {
  display: flex;
  align-items: center;
}
.noticeWrap .textspan {
  flex-shrink: 0;
}
</style>
