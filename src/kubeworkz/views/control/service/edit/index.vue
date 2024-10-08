<template>
  <div>
    <el-form
      ref="form"
      :model="model"
      label-position="right"
      label-width="120px"
    >
      <el-form-item
        label="Name"
        prop="metadata.name"
        :rules="[
          validators.required(),
          validators.k8sResourceNameValidator()
        ]"
      >
        <div style="color: rgb(153, 153, 153);">
          Access associated workload instances through Layer 4 load balancing
        </div>
        <el-input
          v-model="model.metadata.name"
          :disabled="isEdit"
          placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
        />
      </el-form-item>
      <el-form-item label="Type">
        <el-radio-group
          v-model="type"
          :disabled="isEdit && model.spec.template === 'headless'"
        >
          <el-radio label="ClusterIP">
            ClusterIP
          </el-radio>
          <el-radio label="nodePort">
            NodePort
          </el-radio>
        </el-radio-group>
        <div style="color: rgb(153, 153, 153);">
          {{ typeDescription }}
        </div>
      </el-form-item>
      <el-form-item
        v-if="type === 'ClusterIP'"
        label="Usage"
      >
        <el-radio-group
          v-model="model.spec.template"
          :disabled="isEdit && model.spec.template === 'headless'"
        >
          <el-radio label="normal">
            Regular services
          </el-radio>
          <el-radio
            label="headless"
            :disabled="isEdit && model.spec.template !== 'headless'"
          >
            Headless service
          </el-radio>
          <el-radio label="external">
            External services
          </el-radio>
        </el-radio-group>
        <div style="color: rgb(153, 153, 153);">
          {{ templateDescription }}
        </div>
      </el-form-item>
      <el-form-item
        label="Label"
        layout="block"
      >
        <label-editor
          v-model="model.metadata.labels"
          :workload="'services'"
          prefix-key="labels"
          :project-name="project"
          :instance-name="model.metadata.name"
          prefix-prop="metadata.labels"
          :insert-nsf-label.sync="insertNsfLabel"
          @insertNsfLabelChange="handleInsertNsfLabelChange"
        />
      </el-form-item>
      <deploymentStatefulsetsInput
        ref="deploymentStatefulsetsInput"
        v-model="model.spec.matchLabels"
        :insert-nsf-label="insertNsfLabel"
        prop="spec.matchLabels"
        :show-switch="model.spec.template === 'headless'"
        :switch-status.sync="model.spec.enableSelecter"
        :show-mode-radio="true"
        :is-edit="isEdit"
        :required="!(model.spec.template === 'headless' && !model.spec.enableSelecter)"
        :show-resource="model.spec.template !== 'headless' ? [ 'deployments', 'statefulsets' ] : [ 'statefulsets' ]"
        :service-name="model.metadata.name"
      />
      <portsEditor
        v-model="model.spec.ports"
        prefix-prop="spec.ports"
        :is-node-port="model.spec.template === 'nodePort'"
        :required="model.spec.template !== 'headless' || (model.spec.template === 'headless' && !model.spec.enableSelecter && !!model.endpoints.length)"
        :is-edit="isEdit"
      />
      <el-form-item
        v-if="model.spec.template === 'headless' && !model.spec.enableSelecter"
        label="Endpoints"
        prop="endpoints"
      >
        <div style="color: rgb(153, 153, 153);">
          Please enter an IP address. Multiple IP addresses should be separated by spaces. Entering the following IP addresses is not supported: 127.0.0.0/8, 169.254.0.0/16, 224.0.0.0/24.
        </div>
        <chipsInput
          v-model="model.endpoints"
          prefix-prop="endpoints"
          :rules="chipRules"
          placeholder="需填写正确的 IP 地址，多个 IP 地址以空格分隔"
        />
      </el-form-item>
      <el-form-item
        v-if="model.spec.template === 'external'"
        label="External IP"
        prop="spec.externalIPs"
        :rules="[
          validators.required()
        ]"
      >
        <div style="color: rgb(153, 153, 153);">
          Please enter an IP address. Multiple IP addresses should be separated by spaces. Entering the following IP addresses is not supported: 127.0.0.0/8, 169.254.0.0/16, 224.0.0.0/24.
        </div>
        <chipsInput
          v-model="model.spec.externalIPs"
          prefix-prop="spec.externalIPs"
          :rules="chipRules"
          placeholder="The correct IP address needs to be filled in. Multiple IP addresses should be separated by spaces."
        />
      </el-form-item>
      <el-form-item
        v-if="model.spec.template !== 'headless'"
        label="Session persistence"
      >
        <el-switch v-model="serviceSessionSwitch" />
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
import { get as getFunc, set, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import {
    toPlainObject as toServicePlainObject,
    toK8SObject as toServiceK8SObject,
    patchK8SObject as toPatchServiceObject,
} from 'kubeworkz/k8s-resources/service';
import workloadService from 'kubeworkz/services/k8s-resource';
import portsEditor from './ports.vue';
import {
    SERVICE_LOAD_BALANCER_IP_TYPE_MAP, NLB,
} from 'kubeworkz/utils/constants';
import deploymentStatefulsetsInput from './component/deployment-statefulsets-input.vue';
import * as validators from 'kubeworkz/utils/validators';
import chipsInput from './component/chips-input.vue';
export default {
    components: {
        portsEditor,
        deploymentStatefulsetsInput,
        chipsInput,
    },
    props: {
        instance: Object,
    },
    data() {
        const temp = cloneDeep(this.instance) || toServicePlainObject();
        temp.endpoints = [];
        return {
            submitLoading: false,
            validators,
            model: temp,
            group: [],
            chipRules: [
                {
                    message: 'IP address format is incorrect',
                    validator: (val, list) => {
                        return /^[\d.\s]+$/.test(val);
                    },
                },
                {
                    message: 'IP address format is incorrect',
                    validator: (val, list) => {
                        const arr = val.split('.');
                        if (arr.length !== 4) return false;
                        if (
                            arr.some(
                                item =>
                                    !item.length ||
                                        isNaN(item) ||
                                        item < 0 ||
                                        item > 255
                            )
                        ) { return false; }
                        return true;
                    },
                },
                {
                    message: 'This IP address already exists',
                    validator: (val, list) => {
                        return !list.includes(val);
                    },
                },
                {
                    message: 'The IP address is within a prohibited address range',
                    validator: (val, list) => {
                        const arr = val.split('.');
                        // 127.0.0.0/8
                        if (+arr[0] === 127) return false;
                        // 169.254.0.0/16
                        if (+arr[0] === 169 && +arr[1] === 254) { return false; }
                        // 224.0.0.0/24
                        if (
                            +arr[0] === 224 &&
                                +arr[1] === 0 &&
                                +arr[2] === 0
                        ) { return false; }
                        return true;
                    },
                },
                {
                    message: 'Add up to 1000 IP addresses',
                    validator: (val, list) => {
                        return list.length < 1000;
                    },
                },
            ],
            ipTypes: Object.keys(
                SERVICE_LOAD_BALANCER_IP_TYPE_MAP
            ).map(key => ({
                text: SERVICE_LOAD_BALANCER_IP_TYPE_MAP[key].text,
                value: key,
            })),
            crdList: [],
            advanceSetting: false,
            endpoints: [],
            hasEndpoints: false,
            insertNsfLabel: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        project: get('scope/project@value'),
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        type: {
            get() {
                const s = getFunc(this.model, 'spec.template');
                return [ 'normal', 'external', 'headless' ].includes(s) ? 'ClusterIP' : s;
            },
            set(val) {
                // console.log(val);
                if (val === 'nodePort') {
                    set(this.model, 'spec.template', 'nodePort');
                }
                if (val === 'ClusterIP') {
                    set(this.model, 'spec.template', 'normal');
                }
            },
        },
        ipType: {
            get() {
                return getFunc(this.model, 'spec.ipType') || '';
            },
            set(val) {
                const ipType = val;
                const ipTypeText = SERVICE_LOAD_BALANCER_IP_TYPE_MAP[ipType].text;
                set(this.model, 'spec.ipTypeText', ipTypeText);
                set(this.model, 'spec.ipType', ipType);
            },
        },
        serviceSessionSwitch: {
            get() {
                return getFunc(this.model, 'spec.sessionAffinity') === 'ClientIP';
            },
            set(val) {
                set(this.model, 'spec.sessionAffinity', val ? 'ClientIP' : 'None');
            },
        },
        typeDescription() {
            if (this.type === 'nodePort') return 'Exposed to access outside the cluster through cluster node static ports.';
            if (this.type === 'ClusterIP') return 'Exposed to other workloads in the same cluster through cluster internal domain names.';
            return '';
        },
        templateDescription() {
            if (this.model.spec.template === 'headless') return 'Used in the StatefulSet creation process, associated to the StatefulSet resource, and provides a static domain name for the StatefulSet working copy.';
            if (this.model.spec.template === 'external') return 'Expose external IP addresses through External to access services within the cluster';
            return '';
        },
    },
    watch: {
        'model.metadata.name': function(val) {
            const target = this.model.metadata.labels.find(item => item.key === 'nsf.skiff.kubeworkz.com/app');
            if (target) {
                target.value = val;
            }
        },
    },
    async created() {
        this.$watch('model', (newVal, oldVal) => {
            this.$emit('inputChange', true);
        },
        {
            deep: true,
        });
        this.loadCrdList();
        if (this.isEdit) {
            if (this.model.spec.template === 'headless' && !this.model.spec.enableSelecter) {
                try {
                    const res = await workloadService.getAPIV1Instance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'endpoints',
                            name: this.model.metadata.name,
                        },
                        noAlert: true,
                    });
                    this.model.endpoints = getFunc(res, 'subsets[0].addresses', []).map(item => item.ip);
                    console.log(this.model.endpoints);
                    this.hasEndpoints = true;
                } catch (error) {
                    console.log(error);
                }
            }
        }
    },
    methods: {
        handleInsertNsfLabelChange(value) {
            if (value) {
                this.$refs.deploymentStatefulsetsInput.forceUpdateMode('hard', [{ key: 'nsf.skiff.kubeworkz.com/app', value: this.model.metadata.name }]);
            } else {
                this.$refs.deploymentStatefulsetsInput.forceUpdateMode('');
            }
        },
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
                    const yaml = toPatchServiceObject(this.model);
                    yaml.metadata.annotations = {};
                    await workloadService.modifyAPIV1Instance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'services',
                            name: this.instance.metadata.name,
                        },
                        data: yaml,
                        noAlert: true,
                    });
                    // Handle endpoints
                    if (this.model.spec.template === 'headless') {
                        if (this.model.spec.enableSelecter && this.hasEndpoints) {
                            // Delete endpoints
                            await this.deleteEndpoints();
                        } else if (!this.model.spec.enableSelecter && this.hasEndpoints && !this.model.endpoints.length) {
                            // Delete endpoints
                            await this.deleteEndpoints();
                        } else if (!this.model.spec.enableSelecter && this.hasEndpoints && !!this.model.endpoints.length) {
                            // Update endpoints
                            await this.updateEndpoints();
                        } else if (!this.model.spec.enableSelecter && !this.hasEndpoints && !!this.model.endpoints.length) {
                            // Create endpoints
                            await this.createdEndpoints();
                        }
                    }
                } else {
                    const yaml = toServiceK8SObject(this.model);
                    // console.log(yaml);
                    // return Promise.resolve()
                    yaml.metadata.annotations = {};
                    await workloadService.createAPIV1Instance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'services',
                        },
                        data: yaml,
                        noAlert: true,
                    });
                    // Handle endpoints
                    if (this.model.spec.template === 'headless' && !this.model.spec.enableSelecter && this.model.endpoints.length) {
                        //
                        await this.createdEndpoints();
                    }
                }
                this.$emit('inputChange', false);
                this.$router.push({ path: '/control/services/list' });
            } catch (err) {
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.submitLoading = false;
        },
        handleBandwidthModeChange(val) {
            if (val === 'user') {
                this.model.spec.bandWidth = 1000;
            }
        },
        getBandWidthKey(ipType) {
            return `kubeworkz.com_loadbalancer_${ipType}_bandwidth`;
        },
        async loadCrdList() {
            try {
                const result = await workloadService.getCRD({
                    pathParams: {
                        cluster: this.cluster,
                    },
                    params: {
                        pageNum: 1,
                        pageSize: 999,
                        selector: 'spec.scope=Cluster',
                    },
                });
                const itemnames = result.items.map(i => i.metadata.name);
                this.crdList = itemnames;
            } catch (error) {
                console.log(error);
            }
        },
        handleValidate() {
            this.$refs.observer.validate();
        },
        async createdEndpoints() {
            await workloadService.createAPIV1Instance({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'endpoints',
                },
                data: {
                    kind: 'Endpoints',
                    apiVersion: 'v1',
                    metadata: {
                        name: this.model.metadata.name,
                        namespace: this.namespace,
                    },
                    subsets: [
                        {
                            addresses: this.model.endpoints.map(ip => {
                                return {
                                    ip,
                                };
                            }),
                            ports: this.model.spec.ports.map(item => ({
                                name: item.name,
                                protocol: item.protocol,
                                port: parseInt(item.targetPort),
                            })),
                        },
                    ],
                },
            });
        },
        async updateEndpoints() {
            await workloadService.modifyAPIV1Instance({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'endpoints',
                    name: this.model.metadata.name,
                },
                data: {
                    kind: 'Endpoints',
                    apiVersion: 'v1',
                    metadata: {
                        name: this.model.metadata.name,
                        namespace: this.namespace,
                    },
                    subsets: [
                        {
                            addresses: this.model.endpoints.map(ip => {
                                return {
                                    ip,
                                };
                            }),
                            ports: this.model.spec.ports.map(item => ({
                                name: item.name,
                                protocol: item.protocol,
                                port: parseInt(item.targetPort),
                            })),
                        },
                    ],
                },
            });
        },
        async deleteEndpoints() {
            await workloadService.deleteAPIV1Instance({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'endpoints',
                    name: this.model.metadata.name,
                },
            });
        },
    },
};
</script>

<style module>
.desc {
    display: block;
    max-width: 580px;
    color: #999;
    padding-bottom: 10px;
}
.mode {
    margin-bottom: 20px;
}
.more {
    display: block;
    color: #508ae2;
    width: 120px;
    margin-bottom: 20px;
    text-align: right;
}
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubeworkz/assets/question.svg');
    cursor: pointer;
}
</style>
