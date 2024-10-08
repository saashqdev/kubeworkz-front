<template>
  <div>
    <el-form
      ref="form"
      :model="model"
      label-position="right"
      label-width="120px"
      style="width:80%"
    >
      <el-form-item
        label="Name"
        prop="metadata.name"
        :rules="[
          validators.required(),
          validators.k8sResourceNameValidator()
        ]"
      >
        <el-input
          v-model="model.metadata.name"
          :disabled="isEdit"
          placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
        />
      </el-form-item>
      <el-form-item
        label="Data"
      >
        <configmap-input
          v-model="model.data"
          prefix-prop="data"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submit"
        >
          {{ isEdit ? 'Modify now' : 'Create now' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { cloneDeep, get as getFunc, set as setFun } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toConfigmapPlainObject,
    toK8SObject as toConfigmapK8SObject,
    patchK8SObject as toPatchConfigmapObject,
} from 'kubeworkz/k8s-resources/configmap';
import {
    SECRET_TYPES,
} from 'kubeworkz/utils/constants';
import configmapInput from './configmap-input.vue';
import * as validators from 'kubeworkz/utils/validators';

export default {
    components: {
        configmapInput,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            validators,
            SECRET_TYPES,
            model: cloneDeep(this.instance) || toConfigmapPlainObject(),
            submitLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        tenant: get('scope/tenant@value'),
        project: get('scope/project@value'),
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
    },
    methods: {
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            this.submitLoading = true;
            try {
                if (this.isEdit) {
                    const puresource = this.model.puresource;
                    const yaml = toPatchConfigmapObject(this.model);
                    setFun(puresource, 'data', yaml.data);
                    setFun(puresource, 'metadata.annotations', yaml.metadata.annotations);
                    await workloadService.modifyAPIV1Instance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'configmaps',
                            name: this.instance.metadata.name,
                        },
                        data: puresource,
                        noAlert: true,
                    });
                } else {
                    const yaml = toConfigmapK8SObject(this.model);
                    await workloadService.createAPIV1Instance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'configmaps',
                        },
                        data: yaml,
                        noAlert: true,
                    });
                }
                this.$router.push({ path: '/control/configmaps/list' });
            } catch (err) {
                console.log(err);
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.submitLoading = false;
        },
        handleValidate() {
            this.$refs.observer.validate();
        },
    },
};
</script>

<style module>
.desc {
    display: inline-block;
    max-width: 580px;
    color: #999;
    padding-bottom: 10px;
}
.mode {
    margin-bottom: 20px;
}
.wrap {
    margin-bottom: 20px;
}
.title {
    margin-bottom: 5px;
}
.upload {
    position: absolute;
    bottom: -25px;
    right: 0;
}
.textarea[class] {
    width: 580px;
    height:150px;
}
.uploader[class] {
    display: block;
}
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubeworkz/assets/question.svg');
    cursor: pointer;
}
</style>
