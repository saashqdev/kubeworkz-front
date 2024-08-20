<template>
  <div>
    <el-form
      ref="form"
      :model="model"
      :rules="rules"
      label-position="right"
      label-width="160px"
    >
      <el-form-item
        v-if="workload === 'jobs' || workload === 'cronjobs'"
        label="Restart strategy"
        prop="podTemplate.spec.restartPolicy"
      >
        <el-radio-group v-model="model.podTemplate.spec.restartPolicy">
          <el-radio-button
            v-for="item in restartPolicyList"
            :key="item.value"
            :label="item.value"
          >
            {{ item.text }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <repo-secret-config v-model="model.podTemplate.spec.imagePullSecrets" />
      <el-form-item label="Label">
        <labelEditor
          v-model="model.podTemplate.metadata.labels"
          :workload="workload"
          :project-name="project"
          prefix-key="labels"
          :service-list="serviceList"
          prefix-prop="podTemplate.metadata.labels"
        />
      </el-form-item>
      <el-form-item label="Annotation">
        <labelEditor
          v-model="model.podTemplate.metadata.annotations"
          :workload="''"
          prefix-key="annotations"
          prefix-prop="podTemplate.metadata.annotations"
        />
      </el-form-item>
      <el-form-item v-if="workload === 'deployments'">
        <template slot="label">
          HostNetwork
          <el-tooltip
            effect="dark"
            content="To avoid port conflicts caused by replica migration, set node affinity to ensure that replicas are scheduled to fixed nodes. In hostnetwork mode, the load using service and ingress is invalid."
            placement="right"
            popper-class="ncs-el-tooltip-popper"
          >
            <i
              class="el-icon-question"
              style="position: absolute;right:4px;top:11px"
            />
          </el-tooltip>
        </template>
        <el-switch v-model="model.podTemplate.spec.hostNetwork" />
      </el-form-item>
      <deploy-config
        v-model="model.podTemplate.spec.deploymentStrategy"
        :host-network-support="model.podTemplate.spec.hostNetwork"
        prefix-prop="podTemplate.spec.deploymentStrategy"
      />
      <template v-if="['cronjobs', 'jobs'].includes(workload)">
        <job-config
          v-if="workload === 'jobs'"
          v-model="model.spec"
          prefix-prop="spec"
        />
        <job-config
          v-else
          v-model="model.jobTemplate"
          prefix-prop="jobTemplate"
        />
      </template>
      <template v-if="workload === 'cronjobs'">
        <el-form-item
          label="Timing rules"
        >
          <el-form-item
            :prop="`spec.concurrencyPolicy`"
            label=""
            :rules="[
              validators.required(),
            ]"
            style="display: flex;margin-bottom: 22px"
          >
            <template slot="label">
              Concurrency strategy
              <el-tooltip
                effect="dark"
                placement="right"
                popper-class="ncs-el-tooltip-popper"
              >
                <div slot="content">
                  Forbid: Do not create a new task while the previous task is not completed<br>
                  Allow: Scheduled tasks continue to create new tasks, which will seize cluster resources.<br>
                  Replace: When the new task creation time is reached and the previous task is not completed, the new task will replace the previous task.<br>
                </div>
                <i
                  class="el-icon-question"
                  style="position: absolute;right:4px;top:11px"
                />
              </el-tooltip>
            </template>
            <el-radio-group v-model="model.spec.concurrencyPolicy">
              <el-radio-button
                v-for="item in concurrencyPolicyList"
                :key="item.value"
                :label="item.value"
              >
                {{ item.text }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            :prop="`spec.schedule`"
            label="Schedule scheduling settings"
            :rules="[
              validators.required(),
              validators.linuxCronPattern(false),
              validators.fixedFieldNum(5, ' ', false),
            ]"
            style="margin-bottom:22px"
          >
            <el-input
              v-model="model.spec.schedule"
              placeholder="Fill in the correct Linux Cron time format"
            />
            <div>
              The next time the task is executed is: {{ parsedTime }}
            </div>
          </el-form-item>
          <el-form-item
            label="Task record"
          >
            <el-form-item
              label="Keep the number of successfully executed tasks"
              :class="$style.columnFormItem"
            >
              <el-input-number
                v-model="model.spec.successfulJobsHistoryLimit"
                controls-position="right"
                :min="1"
                style="width: 300px;"
                :step-strictly="true"
              />
              <span style="margin-left:8px">Task</span>
            </el-form-item>
            <el-form-item
              label="Keep the number of failed tasks"
              :class="$style.columnFormItem"
            >
              <el-input-number
                v-model="model.spec.failedJobsHistoryLimit"
                controls-position="right"
                :min="1"
                style="width: 300px;"
                :step-strictly="true"
              />
              <span style="margin-left:8px">Task</span>
            </el-form-item>
          </el-form-item>
          <el-form-item
            label="Task start deadline"
            style="margin-bottom:22px"
            :prop="`spec.startingDeadlineSeconds`"
            :rules="[
              validators.consistofNumber(false),
            ]"
          >
            <template slot="label">
              Task start deadline
              <el-tooltip
                effect="dark"
                placement="right"
                popper-class="ncs-el-tooltip-popper"
              >
                <div slot="content">
                  When the concurrency policy is Allow, the task startup deadline is not set, and the task is executed at least once;<br>
                  When the concurrency policy is Forbid, when the new task creation time is reached and a new task cannot be created, it will be marked as missed scheduling.<br>
                  When the cumulative number of missed scheduling reaches 100 times, the scheduled task will no longer start new tasks.<br>
                </div>
                <i
                  class="el-icon-question"
                  style="position: absolute;right:4px;top:11px"
                />
              </el-tooltip>
            </template>
            <el-input
              v-model="model.spec.startingDeadlineSeconds"
              style="width: 300px;"
            />
            <span style="margin-left:8px">Second</span>
          </el-form-item>
        </el-form-item>
      </template>
      <el-form-item>
        <el-button
          color="primary"
          @click="$emit('go', -1)"
        >
          Previous
        </el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submit"
        >
          {{ isEdit ? 'Edit' : 'Create' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import parser from 'cron-parser';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import repoSecretConfig from './repo-secret-config.vue';
import deployConfig from './deploy-config.vue';
import jobConfig from './job-config.vue';
import workloadService from 'kubeworkz/services/k8s-resource';
import { nsfDeploymentAnnotations } from 'kubeworkz/utils/constants';
import labelEditor from 'kubeworkz/elComponent/label-editor.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
        repoSecretConfig,
        deployConfig,
        jobConfig,
        labelEditor,
    },
    mixins: [ makeVModelMixin ],
    props: {
        resolveData: Function,
    },
    data() {
        return {
            validators,
            showDeployConfig: true,
            nsfDeploymentAnnotations,
            restartPolicyList: [
                // { value: 'Always', text: 'Always' },
                { value: 'OnFailure', text: 'OnFailure' },
                { value: 'Never', text: 'Never' },
            ],
            concurrencyPolicyList: [
                { text: 'Forbid', value: 'Forbid' },
                { text: 'Allow', value: 'Allow' },
                { text: 'Replace', value: 'Replace' },
            ],
            serviceList: [],
            rules: {
                'podTemplate.spec.restartPolicy': [
                    { required: true, message: 'Restart policy cannot be empty', trigger: 'blur' },
                ],
            },
            submitLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        project: get('scope/project@value'),
        workload() {
            return this.$route.params.workload;
        },
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
        parsedTime() {
            const schedule = getFunc(this.model, 'spec.schedule');
            if (schedule) {
                try {
                    const interval = parser.parseExpression(schedule);
                    return interval.next().toString();
                } catch (error) {
                    return '';
                }

            }
            return '';
        },
    },
    async created() {
        if (this.workload === 'deployments') {
            const serviceList = await this.loasServiceList();
            const nsfAppLabel = (this.model.podTemplate.metadata.labels || []).find(item => item.key === 'nsf.skiff.kubeworkz.com/app');
            if (nsfAppLabel) {
                nsfAppLabel.selectValues = serviceList;
            }
        }
    },
    methods: {
        async loasServiceList() {
            const res = await workloadService.getAPIV1({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'services',
                },
                params: {
                    pageNum: 1,
                    pageSize: 999,
                },
            });
            this.serviceList = (res.items || []).map(item => ({ text: item.metadata.name, value: item.metadata.name }));
            return this.serviceList;
        },
        async submit() {
            // Trigger verification
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.submitLoading = true;
            try {
                await this.resolveData();
                this.$router.push({ path: `/control/${this.workload}/list` });
            } catch (err) {
                this.$globalErrorModal(getFunc(err, 'details.causes[0]') || err);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style module>
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubeworkz/assets/question.svg');
    cursor: pointer;
}
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
