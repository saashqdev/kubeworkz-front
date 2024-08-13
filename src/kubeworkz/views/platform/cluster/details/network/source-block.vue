<template>
  <div>
    <dynamicCard
      v-model="model"
      :get-default-item="getTemplate"
    >
      <template slot-scope="{ item: dataModel, index: dataIndex }">
        <el-form-item
          label="IP segment"
          style="margin-bottom: 24px;"
        >
          <template slot="label">
            IP segment
            <el-tooltip
              effect="dark"
              placement="right"
              popper-class="ncs-el-tooltip-popper"
            >
              <div slot="content">
                IP rules, namespace, and pod selection rules cannot be set at the same time.
              </div>
              <i
                class="el-icon-question"
                style="position: absolute;right:4px;top:11px"
              />
            </el-tooltip>
          </template>
          <el-radio-group
            v-model="dataModel.ipBlock.enable"
            @change="onChangeIp($event, dataModel)"
          >
            <el-radio :label="false">
              Do not set IP segment
            </el-radio>
            <el-radio :label="true">
              Specify IP segment
            </el-radio>
          </el-radio-group>
          <div v-if="dataModel.ipBlock.enable">
            <div style="padding-left:8px;color:#909399;">
              CIDR
            </div>
            <el-form-item
              :prop="`${prefixProp}.${dataIndex}.ipBlock.cidr`"
              :rules="[
                validators.required(),
                validators.cidr(false),
              ]"
            >
              <el-input
                v-model="dataModel.ipBlock.cidr"
              />
            </el-form-item>
            <cidr-input
              v-model="dataModel.ipBlock.except"
              :prefix-prop="`${prefixProp}.${dataIndex}.ipBlock.except`"
            />
          </div>
        </el-form-item>
        <el-form-item
          label="Namespace rules"
          style="margin-bottom: 24px;"
        >
          <el-radio-group
            v-model="dataModel.namespaceSelector.enable"
            :disabled="dataModel.namespaceSelector.disabled"
          >
            <el-radio :label="false">
              All namespaces
            </el-radio>
            <el-radio :label="true">
              A namespace that complies with the rules
            </el-radio>
          </el-radio-group>
          <regular-input
            v-if="dataModel.namespaceSelector.enable"
            v-model="dataModel.namespaceSelector.matchExpressions"
            :prefix-prop="`${prefixProp}.${dataIndex}.namespaceSelector.matchExpressions`"
          />
        </el-form-item>
        <el-form-item
          label="Pod rules"
          style="margin-bottom: 24px;"
        >
          <el-radio-group
            v-model="dataModel.podSelector.enable"
            :disabled="dataModel.podSelector.disabled"
          >
            <el-radio :label="false">
              All pods
            </el-radio>
            <el-radio :label="true">
              A pod that complies with the rules
            </el-radio>
          </el-radio-group>
          <regular-input
            v-if="dataModel.podSelector.enable"
            v-model="dataModel.podSelector.matchExpressions"
            :prefix-prop="`${prefixProp}.${dataIndex}.podSelector.matchExpressions`"
          />
        </el-form-item>
      </template>
    </dynamicCard>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import blockLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/row.vue';
import cidrInput from './cidr-inputs.vue';
import regularInput from './regular-input.vue';
import dynamicCard from 'kubeworkz/elComponent/dynamic-card/index.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
        cidrInput,
        regularInput,
        dynamicCard,
    },
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            blockLayout,
            blockRowLayout,
            validators,
        };
    },
    methods: {
        getTemplate() {
            return {
                ipBlock: {
                    enable: false,
                    cidr: '',
                    except: [],
                },
                namespaceSelector: {
                    disabled: false,
                    enable: false,
                    matchExpressions: [],
                },
                podSelector: {
                    disabled: false,
                    enable: false,
                    matchExpressions: [],
                },
            };
        },
        onChangeIp($event, model) {
            if ($event) {
                model.namespaceSelector.enable = false;
                model.podSelector.enable = false;
                model.namespaceSelector.disabled = true;
                model.podSelector.disabled = true;
            } else {
                model.namespaceSelector.disabled = false;
                model.podSelector.disabled = false;
            }
        },
    },
};
</script>

<style>

</style>
