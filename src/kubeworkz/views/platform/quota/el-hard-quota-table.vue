<template>
  <div>
    <dynamicBlock
      :value="[{}, {}, {}]"
      :initial-add="true"
      :show-delete-btn="false"
      :show-add-btn="false"
      :columns="[
        {
          title: 'Resource',
          dataIndex: 'resource',
          width: '8%',
        },
        {
          title: 'Request',
          dataIndex: 'request',
          width: '22%',
        },
        {
          title: 'Upper limit',
          dataIndex: 'limit',
          width: '22%',
        },
        {
          title: 'Cluster assignable',
          dataIndex: 'quota',
          width: '16%',
        },
        {
          title: 'Tenant assigned request',
          dataIndex: 'usedRequest',
          width: '16%',
        },
        {
          title: 'Tenant has reached cap',
          dataIndex: 'usedLimit',
          width: '16%',
        }
      ]"
    >
      <template #resource="{index}">
        <div v-if="index === 0">
          CPU
        </div>
        <div v-if="index === 1">
          Memory
        </div>
        <div v-if="index === 2">
          GPU
        </div>
      </template>
      <template #request="{index}">
        <!-- Request -->
        <el-form-item
          v-if="index === 0"
          :prop="`${prefixKey}spec.hard.requestsCpu`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.lessThenEqual(model.spec.hard.limitsCpu, 'The requested resources should be less than or equal to the upper limit resources'),
            validators.numberBetween(0, availables.cpu),
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="model.spec.hard['requestsCpu']" />
            <div :class="$style.unitBox">
              Cores
            </div>
          </div>
        </el-form-item>
        <el-form-item
          v-if="index === 1"
          :prop="`${prefixKey}requestsMemory`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.lessThenEqual(limitsMemory, 'The requested resources should be less than or equal to the upper limit resources'),
            validators.numberBetween(0, memoryTransform(availables.memory)),
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="requestsMemory" />
            <el-select
              v-model="memoryUnit"
              :class="$style.unitSelect"
            >
              <el-option
                label="Mi"
                value="Mi"
              />
              <el-option
                label="Gi"
                value="Gi"
              />
            </el-select>
          </div>
        </el-form-item>
        <el-form-item
          v-if="index === 2"
          :prop="`${prefixKey}spec.hard.requestsNvidiaGpu`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.numberBetween(0, availables.gpu),
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="model.spec.hard['requestsNvidiaGpu']" />
            <div :class="$style.unitBox">
              颗
            </div>
          </div>
        </el-form-item>
      </template>
      <template #limit="{index}">
        <!-- Upper limit -->
        <el-form-item
          v-if="index === 0"
          :prop="`${prefixKey}spec.hard.limitsCpu`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.greateThenEqual(model.spec.hard['requestsCpu'], 'The upper limit resources should be greater than or equal to the requested resources'),
            validators.numberBetween(0),
            validators.lengthBetween(1, 20)
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="model.spec.hard['limitsCpu']" />
            <div :class="$style.unitBox">
              Cores
            </div>
          </div>
        </el-form-item>
        <el-form-item
          v-if="index === 1"
          :prop="`${prefixKey}limitsMemory`"
          :rules="[
            validators.required(),
            validators.consistofNumber(),
            validators.greateThenEqual(requestsMemory, 'The upper limit resources should be greater than or equal to the requested resources'),
            validators.numberBetween(0),
            validators.lengthBetween(1, memoryUnit === 'Gi' ? 17 : 20)
          ]"
        >
          <div :class="$style.unitInputWrap">
            <el-input v-model="limitsMemory" />
            <el-select
              v-model="memoryUnit"
              :class="$style.unitSelect"
            >
              <el-option
                label="Mi"
                value="Mi"
              />
              <el-option
                label="Gi"
                value="Gi"
              />
            </el-select>
          </div>
        </el-form-item>
        <div v-if="index === 2">
          -
        </div>
      </template>
      <template #quota="{index}">
        <!-- Cluster assignable -->
        <div v-if="index === 0">
          {{ availableCPU }}  Cores
        </div>
        <div v-if="index === 1">
          {{ memoryTransform(availableMemory) }} {{ memoryUnit }}
        </div>
        <div v-if="index === 2">
          {{ availableGPU }} Cores
        </div>
      </template>
      <template #usedRequest="{index}">
        <!-- Tenant assigned request -->
        <div v-if="index === 0">
          {{ item.usedCpu }} Cores
        </div>
        <div v-if="index === 1">
          {{ memoryTransform(item.usedMemory) }} {{ memoryUnit }}
        </div>
        <div v-if="index === 2">
          {{ item.usedGpu }} Cores
        </div>
      </template>
      <template #usedLimit="{index}">
        <!-- Tenant has reached cap -->
        <div v-if="index === 0">
          {{ item.usedLimitsCpu }} Cores
        </div>
        <div v-if="index === 1">
          {{ memoryTransform(item.usedLimitsMemory) }} {{ memoryUnit }}
        </div>
        <div v-if="index === 2">
          -
        </div>
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { toNumber } from 'lodash';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import BigNumber from 'bignumber.js';
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block/index.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
        dynamicBlock,
    },
    mixins: [ makeVModelMixin ],
    inject: [ 'elForm' ],
    props: {
        availables: Object,
        item: Object,
        prefixKey: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            memoryUnit: 'Gi',
            validators,
            list: [{}],
        };
    },
    computed: {
        availableCPU() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.cpu).minus(toNumber(this.model.spec.hard.requestsCpu || '0'))), this.availables.cpu);
        },
        availableMemory() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.memory).minus(toNumber(this.model.spec.hard.requestsMemory || '0'))), this.availables.memory);
        },
        availableGPU() {
            return Math.min(Math.max(0, +new BigNumber(this.availables.gpu).minus(toNumber(this.model.spec.hard.requestsNvidiaGpu || '0'))), this.availables.gpu);
        },
        // availableStorage() {
        //     return Math.min(Math.max(0, this.availables.storage - toNumber(this.model.spec.hard['requests.storage'] || '0')), this.availables.storage);
        // },
        requestsMemory: {
            get() {
                const num = this.memoryUnit === 'Gi' ? 1024 : 1;
                const val = this.model.spec.hard.requestsMemory;
                this.model.requestsMemory = val && /^[1-9][0-9]*$/.test(`${val}`) ? val / num : val;
                return this.model.requestsMemory;
            },
            set(val) {
                const num = this.memoryUnit === 'Gi' ? 1024 : 1;
                this.model.spec.hard.requestsMemory = val && /^[1-9][0-9]*$/.test(`${val}`) ? val * num : val;
            },
        },
        limitsMemory: {
            get() {
                const num = this.memoryUnit === 'Gi' ? 1024 : 1;
                const val = this.model.spec.hard.limitsMemory;
                this.model.limitsMemory = val && /^[1-9][0-9]*$/.test(`${val}`) ? val / num : val;
                return this.model.limitsMemory;
            },
            set(val) {
                const num = this.memoryUnit === 'Gi' ? 1024 : 1;
                this.model.spec.hard.limitsMemory = val && /^[1-9][0-9]*$/.test(`${val}`) ? val * num : val;
            },
        },
    },
    mounted() {
        this.$watch('model.spec.hard', () => {
            this.$nextTick(() => {
                this.elForm && this.elForm.validate();
            });
        }, {
            deep: true,
        });
    },
    methods: {
        memoryTransform(val) {
            if (this.memoryUnit === 'Gi') {
                return val && (val / 1024).toFixed(2);
            }
            return val && val.toFixed(2);
        },
    },
};
</script>

<style module>
.table td,
.table th{
    text-align: left;
}
.thead{
    background-color: #f5f7fa;
    background-clip: padding-box;
    border-bottom: 1px solid #ebf0f5;
}
tr.thead > th {
    vertical-align: middle;
    box-sizing: border-box;
    padding: 13px 10px;
    line-height: 20px;
    text-align: left;
    font-weight: 400;
}
.table tr td {
    padding: 20px 1px 6px 10px;
}
.inlineflex {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}
.required{
    position: relative;
}
.required::after {
    content: '*';
    color: red;
    position: absolute;
    right: -.5em;
    height: 12px;
    line-height: 12px;
    top: 0px;
}
.unit {
    margin-left: 4px;
    width: 40px;
}
.inputs {
    width: 110px;
    float:right
}
.inputBox{
  border-radius: 3px 0 0 3px;
  border-right: none;
}
/* .unitSelect {
  padding: 0 4px;
  width: 50px;
  border-radius: 0 3px 3px 0;
}
.unitSelect::after {
  display: none;
}
.unitSelect li {
  padding: 4px 4px;
} */


.unitInputWrap {
  display: flex;
  align-items: center;
}
.unitBox{
  width: 48px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 32px;
  line-height: 32px;
  padding: 0 4px;
  border: 1px solid #e5e5e5;
  border-left: none;
  border-radius: 0 2px 2px 0;
  background-color: #f5f5f5;
  cursor: default;
}
.unitSelect {
   width: 48px;
   flex-grow: 0;
   flex-shrink: 0;
}
.unitSelect :global(.el-input__icon){
  display: none;
}
.unitSelect :global(.el-input__inner){
  padding: 0 4px;
  border-left: none;
}
</style>
