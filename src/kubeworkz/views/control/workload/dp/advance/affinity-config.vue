<template>
  <div>
    <el-form-item
      :label="title"
      :required="required"
      :class="$style.columnFormItem"
    >
      <dynamicCard
        v-model="model"
        :initialAdd="required"
        :minCount="required ? 1 : 0"
        :getDefaultItem="getDataTemplate"
        addButtonText="Add rule"
        :validateFile="prefixProp"
      >
        <template slot-scope="{ item: blockModel, index: blockIndex }">
          <dynamicBlock
            v-model="blockModel.rules"
            :getDefaultItem="getRuleTemplate"
            :columns="[
                {
                    title: 'Key',
                    dataIndex: 'key',
                },
                {
                    title: 'Operator',
                    dataIndex: 'operator',
                },
                {
                    title: 'Values',
                    dataIndex: 'value',
                }
            ]"
          >
            <template v-slot:key="{record: ruleModel, index: ruleIndex}">
              <el-form-item
                label=""
                :prop="`${prefixProp}.${blockIndex}.rules.${ruleIndex}.key`"
                :rules="[
                  ...(required && blockIndex === 0 && ruleIndex === 0 ? [ validators.required() ] : []),
                  validators.startsWithLetter(false),
                  validators.keyPattern(false),
                  validators.noRedundance(blockModel.rules.map(r => r.key), false),
                ]"
              >
                <el-input v-model="ruleModel.key"/>
              </el-form-item>
            </template>
            <template v-slot:operator="{record: ruleModel}">
              <el-select
                v-model="ruleModel.operator"
                :data="operators"
                placeholder="Please choose"
              >
                <el-option
                  v-for="item in operators"
                  :key="item.value"
                  :lable="item.text"
                  :value="item.value"
                />
              </el-select>
            </template>
            <template v-slot:value="{record: ruleModel, index: ruleIndex}">
              <el-form-item 
                label=""
                :prop="`${prefixProp}.${blockIndex}.rules.${ruleIndex}.value`"
                :rules="[
                  ...(required && blockIndex === 0 && ruleIndex === 0 ? [ validators.required() ] : []),
                  validators.multipartLabelValuePatten(/\s/, false),
                  ...(['Gt', 'Lt'].includes(ruleModel.operator) ? [ validators.consistofNumber(false) ] : []),
                ]"
              >
                <el-input
                  v-if="['Exists', 'DoesNotExist'].includes(ruleModel.operator)"
                  disabled
                  value="No need to fill in values"
                />
                <el-input
                  v-else
                  v-model="ruleModel.value"
                />
              </el-form-item>
            </template>
          </dynamicBlock>
          <div
            v-if="['podAntiAffinity', 'podAffinity'].includes(type)"
            style="marginTop: 20px"
          >
            <el-form-item label="Namespace" style="margin-bottom: 22px;">
              {{ namespace }}
            </el-form-item>
            <el-form-item label="Topological domain" style="margin-bottom: 22px;">
              <el-select
                v-model="blockModel.topologyKey"
                placeholder="Please choose"
              >
                <el-option
                  v-for="item in topologyKeyData"
                  :key="item.value"
                  :lable="item.text"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </template>
      </dynamicCard>
    </el-form-item>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import blockLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/row.vue';
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import {
    topologyKeyData,
} from 'kubeworkz';
import {
    getDefaultAffinity,
    getDefaultAffinityRule,
    operators,
} from 'kubeworkz/k8s-resources/pod/affinity';
import * as validators from 'kubeworkz/utils/validators';
const titleMap = {
    nodeAffinity: 'Node affinity',
    podAffinity: 'Replica affinity',
    podAntiAffinity: 'Replica anti-affinity',
};
export default {
    mixins: [ makeVModelMixin ],
    props: {
        type: {
            type: String,
            required: true,
        },
        required: {
            type: Boolean,
            default: false,
        },
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data: () => ({
        validators,
        topologyKeyData: topologyKeyData.map(o => ({
            text: o,
            value: o,
        })),
        blockLayout,
        blockRowLayout,
    }),
    computed: {
        namespace: get('scope/namespace@value'),
        title() {
            return titleMap[this.type];
        },
        operators() {
            return (this.type === 'nodeAffinity' ? operators : operators.slice(0, -2)).map(o => ({
                text: o,
                value: o,
            }));
        },
    },
    methods: {
        getDataTemplate() {
            return getDefaultAffinity(this.type, this.namespace);
        },
        getRuleTemplate() {
            return getDefaultAffinityRule();
        },
    },
};
</script>

<style module>
.columnFormItem {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px !important;
}
.columnFormItem>:global(.el-form-item__content) {
  margin-left: 0 !important;
}
.columnFormItem>:global(.el-form-item__label) {
  align-self: start;
  width: auto !important;
}
</style>
