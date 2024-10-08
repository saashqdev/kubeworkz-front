<template>
  <div>
    <x-request
      ref="request"
      style="margin-top: 10px"
      :service="service"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <i
          v-if="loading"
          class="el-icon-loading"
          style="font-size: 24px"
        />
        <dynamicCard
          v-else
          v-model="model"
          :initial-add="true"
          :min-count="1"
          :get-default-item="getRuleTemplate"
          add-button-text="Add group"
          :validate-file="prefixProp"
        >
          <template slot-scope="{ item: ruleModel, index: ruleIndex }">
            <el-form-item
              label="Domain name"
              :rules="[
                validators.required(),
              ]"
              :prop="`${prefixProp}.${ruleIndex}.host`"
              style="margin-bottom: 24px"
            >
              <host-input
                v-model="ruleModel.host"
                :port="port"
                :domain-suffix-list="domainSuffixList"
              />
            </el-form-item>
            <secretSelect
              v-if="enableSecret"
              v-model="ruleModel.secretName"
              :init-visible="true"
              :prefix-prop="`${prefixProp}.${ruleIndex}.secretName`"
            />
            <el-form-item
              label="Path"
              :rules="[
                validators.required(),
              ]"
              :prop="`${prefixProp}.${ruleIndex}.httpPath`"
            >
              <path-table
                v-model="ruleModel.httpPath"
                :default-service="defaultService"
                :service-list="data"
                :index="ruleIndex"
                :prefix-prop="`${prefixProp}.${ruleIndex}.httpPath`"
              />
            </el-form-item>
          </template>
        </dynamicCard>
      </template>
    </x-request>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import workloadService from 'kubeworkz/services/k8s-resource';
import { toPlainObject as toMetadataPlainObject } from 'kubeworkz/k8s-resources/metadata';
import {
    setValueIfListNotPresent,
} from 'kubeworkz/utils/functional';
import blockLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/row.vue';
import secretSelect from './secret-select.vue';
import pathTable from './path-table.vue';
import k8sCommonExtendResourceService from 'kubeworkz/services/k8s-common-extend-resource';
import hostInput from './host-input.vue';
import dynamicCard from 'kubeworkz/elComponent/dynamic-card/index.vue';
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block/index.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
        secretSelect,
        pathTable,
        hostInput,
        dynamicCard,
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    props: {
        enableSecret: Boolean,
        port: Number,
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
            service: workloadService.getAPIV1,
            defaultService: '',

            blockLayout,
            blockRowLayout,
            domainSuffixList: [],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        project: get('scope/project@value'),
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'services',
                },
                params: {
                    pageSize: 10000,
                },
            };
        },
    },
    created() {
        this.loadDomainSuffix();
    },
    methods: {
        resolver(response) {
            const list = (response.items || []).map(toMetadataPlainObject).map(metadata => {
                return {
                    text: metadata.name,
                    value: metadata.name,
                    ...metadata,
                };
            });
            setValueIfListNotPresent({
                list,
                path: 'value',
                current: this.defaultService,
            }, val => {
                this.defaultService = getFunc(val, 'value');
            });
            return list;
        },
        getRuleTemplate() {
            return {
                host: '',
                secretName: '',
                httpPath: [],
            };
        },
        getRowErrorTip() {

        },
        async loadDomainSuffix() {
            const res = await k8sCommonExtendResourceService.getResources({
                pathParams: {
                    resource: 'ingressDomainSuffix',
                },
                params: {
                    cluster: this.cluster,
                    project: this.project,
                },
            });
            this.domainSuffixList = res.map(val => ({ value: val, text: val }));
        },
    },
};
</script>

<style>

</style>
