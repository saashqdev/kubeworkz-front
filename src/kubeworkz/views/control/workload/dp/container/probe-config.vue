<template>
  <el-form-item
    :label="probeMapping[probe]"
  >
    <el-switch
      v-model="model.enable"
    />
    <template v-if="model.enable">
      <template v-if="['LivenessProbe', 'ReadyProbe'].includes(probe)">
        <el-form-item
          label="Failure threshold"
          style="margin-bottom: 22px;"
        >
          <el-input-number
            v-model="model.failureThreshold"
            controls-position="right"
            :min="1"
            style="width: 300px;"
          />
          <span style="margin-left:8px">Second-rate</span>
        </el-form-item>
        <el-form-item
          label="Health threshold"
          style="margin-bottom: 22px;"
        >
          <el-input-number
            v-model="model.successThreshold"
            controls-position="right"
            :min="1"
            style="width: 300px;"
            :disabled="probe === 'LivenessProbe'"
          />
          <span style="margin-left:8px">Second-rate</span>
        </el-form-item>
        <el-form-item
          label="Initial waiting time"
          style="margin-bottom: 22px;"
        >
          <el-input-number
            v-model="model.initialDelaySeconds"
            controls-position="right"
            :min="0"
            style="width: 300px;"
          />
          <span style="margin-left:8px">Second</span>
        </el-form-item>
        <el-form-item
          label="Monitoring interval"
          style="margin-bottom: 22px;"
        >
          <el-input-number
            v-model="model.periodSeconds"
            controls-position="right"
            :min="1"
            style="width: 300px;"
          />
          <span style="margin-left:8px">Second</span>
        </el-form-item>
        <el-form-item
          label="Detection timeout"
          style="margin-bottom: 22px;"
        >
          <el-input-number
            v-model="model.timeoutSeconds"
            controls-position="right"
            :min="1"
            style="width: 300px;"
          />
          <span style="margin-left:8px">Second</span>
        </el-form-item>
      </template>
      <el-form-item
        label="Detection method"
        style="margin-bottom: 22px;"
      >
        <el-radio-group v-model="model.method">
          <el-radio-button
            v-for="item in types"
            :key="item.value"
            :label="item.value"
          >
            {{ item.text }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="model.method === 'exec'"
        label="Execute script"
        style="margin-bottom: 22px;"
        :prop="`${prefixKey}.command`"
        :rules="[
          { required: true, message: 'Execution script cannot be empty'},
        ]"
      >
        <qz-editor
          v-model="model.command"
          style="border: 1px solid #E1E8ED"
          height="160"
          width="580"
          theme="vs"
          language="shell"
          :options="{ minimap: {enabled: false} }"
        />
      </el-form-item>
      <template v-else>
        <el-form-item
          label="Host"
          style="margin-bottom: 22px;"
        >
          <el-input
            v-model="model.host"
          />
        </el-form-item>
        <el-form-item
          v-if="model.method === 'httpGet'"
          label="Path"
          style="margin-bottom: 22px;"
          :prop="`${prefixKey}.path`"
          :rules="[
            { required: true, message: 'Path cannot be empty'},
            validators.startsWithSlash(true),
            validators.consistofPath(true)
          ]"
        >
          <el-input
            v-model="model.path"
          />
        </el-form-item>
        <el-form-item label="Port">
          <el-input-number
            v-model="model.port"
            :min="1"
            :max="65535"
            style="width: 300px;"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item
          v-if="model.method === 'httpGet'"
          label="Header"
        >
          <dynamicBlock
            v-model="model.httpHeaders"
            :get-default-item="getDataTemplate"
            :columns="[
              {
                title: 'Name',
                dataIndex: 'name',
              },
              {
                title: 'Value',
                dataIndex: 'value',
              },
            ]"
          >
            <template #name="{record}">
              <el-input v-model="record.name" />
            </template>
            <template #value="{record}">
              <el-input v-model="record.value" />
            </template>
          </dynamicBlock>
        </el-form-item>
      </template>
    </template>
  </el-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import * as validators from 'kubeworkz/utils/validators';
const probeMapping = {
    LivenessProbe: 'Liveness probe',
    ReadyProbe: 'Readiness probe',
    LifePreStopProbe: 'Life cycle - before stopping',
    LifePostStopProbe: 'Life cycle-after startup',
};
export default {
    mixins: [ makeVModelMixin ],
    props: {
        prefixKey: {
            type: String,
            default: '',
        },
        probe: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            validators,
            probeMapping,
            types: [
                { value: 'exec', text: 'Script' },
                { value: 'httpGet', text: 'HTTP' },
                { value: 'tcpSocket', text: 'TCP' },
            ],
        };
    },
    methods: {
        getDataTemplate() {
            return {
                name: '',
                value: '',
            };
        },
    },
};
</script>

<style>

</style>
