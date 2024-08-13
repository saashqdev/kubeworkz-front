<template>
  <div>
    <i
      v-if="loading"
      class="el-icon-loading"
      style="font-size: 24px"
    />
    <el-form
      v-else
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
          validators.k8sResourceNameValidator(),
        ]"
      >
        <el-input
          v-model="model.metadata.name"
          :disabled="isEdit"
          placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
        />
      </el-form-item>
      <el-form-item
        label="Namespace"
        prop="metadata.namespace"
        :rules="[
          validators.required()
        ]"
      >
        <ns-select
          v-model="model.metadata.namespace"
          :cluster="cluster"
          :disabled="isEdit"
        />
      </el-form-item>
      <el-form-item
        label="Access target"
      >
        <el-radio-group v-model="selections.target">
          <el-radio label="all">
            All pods
          </el-radio>
          <el-radio label="regular">
            A pod that complies with the rules
            <el-tooltip
              effect="dark"
              content="There is an 'AND' relationship between multiple rules, and there is at least one rule"
              placement="right"
              popper-class="ncs-el-tooltip-popper"
            >
              <i class="el-icon-question" />
            </el-tooltip>
          </el-radio>
        </el-radio-group>
        <template
          v-if="selections.target === 'regular'"
        >
          <regular-input
            v-model="model.spec.podSelector"
            prefix-key="target"
            prefix-prop="spec.podSelector"
            :is-required="true"
          />
        </template>
      </el-form-item>
      <el-form-item
        label="Inbound rules"
      >
        <div>
          Source restrictions
        </div>
        <el-radio-group v-model="selections.insource">
          <el-radio label="all">
            Allow all inbound access
          </el-radio>
          <el-radio label="none">
            Block all inbound access
          </el-radio>
          <el-radio label="regular">
            Allow inbound access that meets rules
            <el-tooltip
              effect="dark"
              content="here is an 'OR' relationship between multiple rules, and there is at least one rule. When space and copy rules coexist, the two are 'AND' filtered sources"
              placement="right"
              popper-class="ncs-el-tooltip-popper"
            >
              <i class="el-icon-question" />
            </el-tooltip>
          </el-radio>
        </el-radio-group>
        <template v-if="selections.insource === 'regular'">
          <source-block
            v-model="model.spec.ingress.from"
            prefix-prop="spec.ingress.from"
          />
          <div style="margin-top: 24px">
            Port restrictions
          </div>
          <el-radio-group v-model="selections.inport">
            <el-radio label="all">
              Allow access to all ports
            </el-radio>
            <el-radio label="regular">
              Allow access to the following ports
              <el-tooltip
                effect="dark"
                content="There is an 'OR' relationship between the rules, and there is at least one port."
                placement="right"
                popper-class="ncs-el-tooltip-popper"
              >
                <i class="el-icon-question" />
              </el-tooltip>
            </el-radio>
          </el-radio-group>
          <template v-if="selections.inport === 'regular'">
            <port-input
              v-model="model.spec.ingress.ports"
              prefix-prop="spec.ingress.ports"
            />
          </template>
        </template>
      </el-form-item>
      <el-form-item
        label="Outbound rules"
      >
        <div>
          Target limit
        </div>
        <el-radio-group v-model="selections.outsource">
          <el-radio label="all">
            Allow all outbound access
          </el-radio>
          <el-radio label="none">
            Block all outbound access
          </el-radio>
          <el-radio label="regular">
            Allow rule-compliant outbound access
            <el-tooltip
              effect="dark"
              content="There is an 'OR' relationship between multiple rules, and there is at least one rule. When space and copy rules coexist, the two are 'AND' filter targets"
              placement="right"
              popper-class="ncs-el-tooltip-popper"
            >
              <i class="el-icon-question" />
            </el-tooltip>
          </el-radio>
        </el-radio-group>
        <template v-if="selections.outsource === 'regular'">
          <source-block
            v-model="model.spec.egress.to"
            prefix-prop="spec.egress.to"
          />
          <div style="margin-top: 24px">
            Port restrictions
          </div>
          <el-radio-group v-model="selections.outport">
            <el-radio label="all">
              Allow access to all ports
            </el-radio>
            <el-radio label="regular">
              Allow access to the following ports
              <el-tooltip
                effect="dark"
                content="There is an 'OR' relationship between multiple rules, and there is at least one port."
                placement="right"
                popper-class="ncs-el-tooltip-popper"
              >
                <i class="el-icon-question" />
              </el-tooltip>
            </el-radio>
          </el-radio-group>
          <template v-if="selections.outport === 'regular'">
            <port-input
              v-model="model.spec.egress.ports"
              prefix-prop="spec.egress.ports"
            />
          </template>
        </template>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submit"
        >
          {{ isEdit ? 'Modify' : 'Create' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toNetworkPolicyPlainObject,
    toK8SObject as toNetworkPolicyK8SObject,
} from 'kubeworkz/k8s-resources/networkPolicy';
import nsSelect from './ns-select.vue';
import regularInput from './regular-input.vue';
import sourceBlock from './source-block.vue';
import portInput from './port-inputs.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
        nsSelect,
        regularInput,
        portInput,
        sourceBlock,
    },
    data() {
        return {
            model: toNetworkPolicyPlainObject(),
            selections: {
                target: 'all',
                insource: 'all',
                inport: 'all',
                outsource: 'all',
                outport: 'all',
            },
            loading: false,
            validators,
            submitLoading: false,
        };
    },
    computed: {
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        cluster() {
            return this.$route.params.name;
        },
        namespace() {
            return this.$route.params.namespace;
        },
        instance() {
            return this.$route.params.instance;
        },
    },
    created() {
        if (this.isEdit) {
            this.load();
        }
    },
    methods: {
        async load() {
            this.loading = true;
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    resource: 'networkpolicies',
                    namespace: this.namespace,
                    name: this.instance,
                },
            };
            const response = await workloadService.getNetworkingInstance(reqParam);
            this.model = toNetworkPolicyPlainObject(response);
            Object.assign(this.selections, this.model.spec.selections);
            this.loading = false;
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
                    const pureSource = this.model.puresource;
                    const yaml = toNetworkPolicyK8SObject(this.model, this.selections);
                    await workloadService.modifyNetworkingInstance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.model.metadata.namespace,
                            resource: 'networkpolicies',
                            name: this.model.metadata.name,
                        },
                        data: {
                            ...pureSource,
                            spec: yaml.spec,
                        },
                    });
                } else {
                    const yaml = toNetworkPolicyK8SObject(this.model, this.selections);
                    await workloadService.createNetworkingInstance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.model.metadata.namespace,
                            resource: 'networkpolicies',
                        },
                        data: yaml,
                    });
                }
                this.$router.push({ path: `/platform/cluster/${this.cluster}/network` });
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
