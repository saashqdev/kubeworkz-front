<template>
    <el-dialog
      title="Custom domain name suffix"
      :visible.sync="show"
      width="800px"
      :close-on-click-modal="false"
    >
      <div>
        This configuration information is used for the domain name suffix used by load balancing (Ingress) forwarding rules.
      </div>
      <el-form ref="form" :model="model">
        <el-form-item label="">
          <dynamicBlock
            v-model="model.domainSuffixList"
            :getDefaultItem="getDataTemplate"
            :columns="[
              {
                title: '',
                dataIndex: 'order',
                width: '120px'
              },
              {
                title: '',
                dataIndex: 'name',
              },
            ]"
          >
            <template v-slot:order="{index}">
              <div style="text-align: right">
                Domain name suffix {{ index + 1 }}:
              </div>
            </template>
            <template v-slot:name="{record, index}">
              <el-form-item 
                label=""
                :prop="`domainSuffixList.${index}.name`"
                :rules="[
                  validators.ingressSuffix(),
                  validators.noRedundance(existSuffixs)
                ]"
              >
                <el-input
                  v-model="record.name"
                />
              </el-form-item>
            </template>
          </dynamicBlock>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" @click="submit" :loading="commitLoading">OK</el-button>
      </div>
    </el-dialog>
</template>
<script>
import k8sResourceService from 'kubeworkz/services/k8s-resource';
import { get } from 'vuex-pathify';
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block/index.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
        dynamicBlock,
    },
    data() {
        return {
            valid: true,
            show: false,
            projectInfo: null,
            model: {
                domainSuffixList: [],
            },
            rules: {
                domainSuffix: [
                    { type: 'string', required: true, trigger: 'input+blur', message: '' },
                    { type: 'string', pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, trigger: 'input', message: '' },
                    { type: 'string', pattern: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/, trigger: 'blur', message: 'Please enter a legal ingress suffix' },
                    { type: 'string', trigger: 'input+blur', message: 'Duplicate domain name suffix', validator: (rule, value, callback) => {
                        const targets = this.model.domainSuffixList.filter(item => item.name).filter(item => item.name === value);
                        if (targets.length > 1) { callback(new Error()); } else { callback(); }
                    } },
                ],
            },
            validators,
            commitLoading: false,
        };
    },
    computed: {
        controlClusterList: get('scope/controlClusterList'),
        existSuffixs() {
            return this.model.domainSuffixList.map(item => item.name).filter(item => item);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                name: '',
            };
        },
        addDomainSuffixItem() {
            this.model.domainSuffixList.push({ name: '' });
        },
        removeDomainSuffixItem(index) {
            this.model.domainSuffixList.splice(index, 1);
        },
        open(projectInfo) {
            this.projectInfo = projectInfo;
            this.model.domainSuffixList = projectInfo.spec.ingressDomainSuffix ? projectInfo.spec.ingressDomainSuffix.map(val => {
                return {
                    name: val,
                };
            }) : [];
            this.show = true;
        },
        close() {
            this.show = false;
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            this.commitLoading = true;
            try {
                await k8sResourceService.patchClusterCRResourceInstance({
                    pathParams: {
                        cluster: this.controlClusterList[0].clusterName,
                        group: 'tenant.kubeworkz.io',
                        version: 'v1',
                        plural: 'projects',
                        name: this.projectInfo.metadata.name,
                    },
                    data: [{
                        op: 'replace',
                        path: '/spec/ingressDomainSuffix',
                        value: this.model.domainSuffixList.map(item => item.name).filter(item => item),
                    }],
                    headers: {
                        'Content-Type': 'application/json-patch+json',
                    },
                });
                this.show = false;
                this.$emit('refresh');
            } catch (error) {
                console.log(error);
            }
            this.commitLoading = false;
        },
    },
};
</script>
<style module>
.tableCell{
  line-height: 38px;
}
</style>
