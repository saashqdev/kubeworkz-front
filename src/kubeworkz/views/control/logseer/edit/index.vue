<template>
  <div style="width:700px">
    <el-form
      ref="form"
      :model="model"
      label-position="right"
      label-width="120px"
    >
      <el-form-item
        label="Log task name"
        prop="name"
        :rules="[
          { required: true, message: 'Name is required' },
          validators.k8sResourceNameValidator(),
        ]"
      >
        <el-input
          v-model="model.name"
          :disabled="isEdit"
          placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
        />
      </el-form-item>
      <el-form-item label="Cluster">
        {{ cluster }}
      </el-form-item>
      <el-form-item label="Space">
        {{ namespace }}
      </el-form-item>
      <el-form-item
        label="Tag selector"
        :prop="`labelSelector`"
        :rules="[
          { required: true, message: 'Cannot be empty'},
        ]"
      >
        <template slot="label">
          Tag selector
          <el-tooltip
            effect="dark"
            content="Select the specified workload through Label and collect its logs"
            placement="right"
            popper-class="kube-el-tooltip-popper"
          >
            <i
              class="el-icon-question"
              style="position: absolute;right:4px;top:11px"
            />
          </el-tooltip>
        </template>
        <workloadLableSelect
          v-model="model.labelSelector"
          :disabled="isEdit"
          :cluster="cluster"
          :namespace="namespace"
          prefix-prop="labelSelector"
        />
      </el-form-item>
      <el-form-item label="Collect configuration items">
        <dynamicTab
          v-model="model.inputs"
          validate-file="inputs"
          :initial-add="true"
          :min-count="1"
          :mini-formatter="(item, index) => {
            return `Configuration-${index + 1}`
          }"
          :get-default-item="getDefaultInputItem"
        >
          <template slot-scope="{item, index}">
            <el-form-item
              label="Configuration item name"
              :prop="`inputs.${index}.name`"
              :rules="[
                { required: true, message: 'Name is required'},
                validators.k8sResourceNameValidator(),
              ]"
              :class="$style.inputsFieldItem"
            >
              <el-input
                v-model="item.name"
                :disabled="item.exist"
                placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
              />
            </el-form-item>
            <el-form-item
              label="Log source type"
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                Log source type
                <el-tooltip
                  effect="dark"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <template slot="content">
                    Container standard output: the standard output stream in the container;<br>
                    Container logs: text logs generated within the container and metadata information of the container
                  </template>
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <el-radio-group
                v-model="item.type"
                @input="(val) => {
                  item.paths = val === 'dockerStdout' ? [ { path: 'stdout' } ] : [];
                }"
              >
                <el-radio label="dockerStdout">
                  Container standard output
                </el-radio>
                <el-radio label="k8sLogfile">
                  Container log files
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="Log collection path"
              :class="$style.inputsFieldItem"
            >
              <template v-if="item.type === 'dockerStdout'">
                <el-input
                  :value="item.paths[0].path"
                  disabled
                />
              </template>
              <template v-if="item.type === 'k8sLogfile'">
                <pathInput
                  v-model="item.paths"
                  placeholder="Enter log path or glob expression"
                  :prefix-prop="`inputs.${index}.paths`"
                  :required="true"
                  :rules="[
                    validators.startsWithSlash(false)
                  ]"
                />
              </template>
            </el-form-item>
            <el-form-item
              label="Container"
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                Container
                <el-tooltip
                  effect="dark"
                  content="Container"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <el-input
                v-model="item.containerName"
                placeholder="Enter container name"
              />
            </el-form-item>
            <el-form-item
              label="Meta information/Injection Pod tag"
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                Meta information/custom tags
                <el-tooltip
                  effect="dark"
                  content="Inject the Pod's label, env (environment variable), and annotation (annotation) into the log configuration, which can be used as filtering conditions on the log query page."
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <matchFieldInput
                v-model="item.matchFields"
                :prefix-prop="`inputs.${index}.matchFields`"
              />
            </el-form-item>
            <el-form-item
              label="Meta information/custom tags"
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                Meta information/custom tags
                <el-tooltip
                  effect="dark"
                  content="Customized Key-Value value, which can be used as filtering conditions on the log query page"
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <labelEditor
                v-model="item.fields"
                :prefix-prop="`inputs.${index}.fields`"
              />
            </el-form-item>
            <el-form-item
              label="Log multi-line configuration"
              :class="$style.inputsFieldItem"
            >
              <div style="display:flex;align-items:center;height:36px">
                <el-switch
                  v-model="item.multiline.active"
                  style="margin-right:8px"
                />
                <el-input
                  v-if="item.multiline.active"
                  v-model="item.multiline.pattern"
                  placeholder="Enter a regular expression that matches multiple lines"
                />
              </div>
            </el-form-item>
            <el-form-item
              label="Exclude logs "
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                Exclude logs
                <el-tooltip
                  effect="dark"
                  content="Files under this path will be ignored and log content will not be collected."
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <pathInput
                v-model="item.excludeFiles"
                placeholder="Supports regular matching, it is recommended to exclude compressed files, for example:\.gz$"
                :prefix-prop="`inputs.${index}.excludeFiles`"
              />
            </el-form-item>
            <el-form-item
              label="Ignore log file duration  "
              :class="$style.inputsFieldItem"
            >
              <template slot="label">
                Ignore log file duration
                <el-tooltip
                  effect="dark"
                  content="Log files within the corresponding time period from the creation time of the log task will be ignored."
                  placement="right"
                  popper-class="kube-el-tooltip-popper"
                >
                  <i
                    class="el-icon-question"
                    style="position: absolute;right:4px;top:11px"
                  />
                </el-tooltip>
              </template>
              <el-input-number
                v-model="item.ignoreOlder.num"
                controls-position="right"
                :min="0"
                :step="1"
                step-strictly
                style="width:160px"
              />
              <span style="margin-left: 8px">Hour</span>
            </el-form-item>
            <el-form-item
              label="Log retention"
              :class="$style.inputsFieldItem"
            >
              <span style="margin-right: 8px">Keep time</span>
              <el-input-number
                v-model="item.cleanLogs.retainDays"
                controls-position="right"
                :min="0"
                :step="1"
                step-strictly
                style="width:160px"
              />
              <span style="margin-left: 8px">Day</span>
            </el-form-item>
          </template>
        </dynamicTab>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="submit"
        >
          {{ isEdit ? 'Update immediately' : 'Create now' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { get as getFunc, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import { LOG_TYPE } from 'kubeworkz';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toLogconfgPlainObject,
    toModifyObject as toLogconfigObject,
} from 'kubeworkz/k8s-resources/logconfigs-new';
import { toObjectArray } from 'kubeworkz/k8s-resources/base/utils.js';
import pathInput from './components/path-input.vue';
import metaPodInput from './components/meta-pod-input.vue';
import multilineInput from './components/multiline-input.vue';
const demoImg = require('./demo.png');
import * as validators from 'kubeworkz/utils/validators';
import workloadLableSelect from './components/workload-lable-select.vue';
import dynamicTab from 'kubeworkz/elComponent/dynamic-tab.vue';
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block/index.vue';
import matchFieldInput from './components/match-field-input.vue';
import labelEditor from 'kubeworkz/elComponent/label-editor.vue';
import logseerService from 'kubeworkz/services/logseer';
export default {
    filters: {
        retainModeUnit(val) {
            if (val === 'retainNum') return 'Individual';
            if (val === 'retainDays') return 'Day';
            return '';
        },
    },
    components: {
        pathInput,
        metaPodInput,
        multilineInput,
        workloadLableSelect,
        dynamicTab,
        dynamicBlock,
        matchFieldInput,
        labelEditor,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            model: this.instance || toLogconfgPlainObject(),
            validators,
            submitLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
    },
    methods: {
        getDefaultInputItem() {
            return {
                name: '',
                type: 'dockerStdout',
                paths: [
                    {
                        path: 'stdout',
                    },
                ],
                containerName: '',
                matchFields: [], // Meta information/Injection Pod tag
                fields: [], // Meta information/custom tags
                multiline: {
                    active: false,
                    pattern: '',
                },
                ignoreOlder: {
                    num: '24',
                    unit: 'h',
                },
                excludeFiles: [],
                cleanLogs: {
                    retainDays: 1,
                },
            };
        },
        async submit() {
            // Trigger verification
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            const logconfig = toLogconfigObject(this.model);
            console.log(logconfig);
            this.submitLoading = true;
            try {
                if (this.isEdit) {
                    const res = await logseerService.updateLogconfig({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            name: this.instance.name,
                        },
                        data: logconfig,
                    });
                } else {
                    const res = await logseerService.createLogconfig({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                        },
                        data: logconfig,
                    });
                }
            } catch (error) {
                this.submitLoading = false;
                return;
            }
            this.$router.push({ path: '/control/logconfigs/list' });
        },
    },
};
</script>

<style module>
.inputsFieldItem {
  margin-bottom: 22px !important;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.inputsFieldItem :global(.el-form-item__content) {
  margin-left: 0px !important;
  width: 100% !important;
}
.inputsFieldItem :global(.el-form-item__label) {
  width: auto !important;
}
</style>
