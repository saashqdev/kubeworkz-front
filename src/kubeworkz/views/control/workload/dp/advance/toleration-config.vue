<template>
  <div>
   <el-form-item
      label="Toleration"
      :class="$style.columnFormItem"
    >
      <dynamicBlock
        v-model="model"
        :initialAdd="false"
        :minCount="0"
        :getDefaultItem="getDataTemplate"
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
                title: 'Value',
                dataIndex: 'value',
            },
            {
                title: 'Effect',
                dataIndex: 'effect',
            },
            {
                title: 'TolerationSeconds',
                dataIndex: 'tolerationSeconds',
            }
        ]"
      >
        <template slot="th-effect">
          Effect
          <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
            <template slot="content">
              The possible values ​​of effect are NoSchedule | PreferNoSchedule | NoExecute | empty. If effect is empty, it means matching all effects.
            </template>
            <i class="el-icon-question"/>
          </el-tooltip>
        </template>
        <template slot="th-tolerationSeconds">
          TolerationSeconds
          <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
            <template slot="content">
              By default, it is not set, which means it takes effect permanently.
            </template>
            <i class="el-icon-question"/>
          </el-tooltip>
        </template>
        <template v-slot:key="{record: tolerationModel, index}">
          <el-form-item 
            label=""
            :prop="`${prefixProp}.${index}.key`"
            :rules="[
              validators.startsWithLetter(false),
              validators.keyPattern(false),
              validators.noRedundance(exsitKeys, false),
            ]"
          >
            <el-input v-model="tolerationModel.key"/>
          </el-form-item>
        </template>
        <template v-slot:operator="{record: tolerationModel}">
          <el-select v-model="tolerationModel.operator" placeholder="Please choose">
            <el-option
              v-for="item in operators"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
        <template v-slot:value="{record: tolerationModel, index}">
          <el-form-item 
            label=""
            :prop="`${prefixProp}.${index}.value`"
            :rules="[
              validators.labelValuePatten(false),
            ]"
          >
            <el-input
              v-model="tolerationModel.value"
            />
          </el-form-item>
        </template>
        <template v-slot:effect="{record: tolerationModel}">
          <el-select v-model="tolerationModel.effect" placeholder="Please choose">
            <el-option
              v-for="item in effects"
              :key="item.value"
              :label="item.text"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
        <template v-slot:tolerationSeconds="{record: tolerationModel}">

          <el-input-number
            v-if="tolerationModel.effect === 'NoExecute'"
            v-model="tolerationModel.tolerationSeconds"
            controls-position="right"
            :min="0"
          />
          <span v-else>-</span>
        </template>
      </dynamicBlock>
    </el-form-item>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import {
    operators, effects, getDefaultToleration,
} from 'kubeworkz/k8s-resources/pod/toleration.js';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
            operators: operators.map(t => ({ text: t, value: t })),
            effects: effects.map(t => ({ text: t, value: t })),
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(r => r.key);
        },
    },
    methods: {
        getDataTemplate: getDefaultToleration,
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
