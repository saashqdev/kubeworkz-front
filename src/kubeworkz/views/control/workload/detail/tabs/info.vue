<template>
  <div :class="$style.root">
    <el-button
      type="primary"
      style="margin-bottom: 12px"
      @click="viewYAML"
    >
      Check the detail information
    </el-button>
    <el-descriptions
      title="Basic Information"
      :column="1"
    >
      <el-descriptions-item label="Cluster name">
        {{ cluster }}
      </el-descriptions-item>
      <el-descriptions-item label="Namespace">
        {{ namespace }}
      </el-descriptions-item>
      <el-descriptions-item label="Creation time">
        {{ instance.metadata.creationTimestamp | smartDateFormat }}
      </el-descriptions-item>
      <template v-if="workload === 'cronjobs'">
        <el-descriptions-item label="State">
          {{ instance.spec.suspend ? 'suspended' : 'started' }}
        </el-descriptions-item>
        <el-descriptions-item label="Number of running tasks">
          {{ (instance.status.active || []).length }}
        </el-descriptions-item>
        <el-descriptions-item label="Concurrency strategy">
          {{ instance.spec.concurrencyPolicy }}
        </el-descriptions-item>
        <el-descriptions-item label="Schedule scheduling settings">
          {{ instance.spec.schedule }}
        </el-descriptions-item>
        <el-descriptions-item label="Keep the number of successfully executed tasks">
          {{ instance.spec.successfulJobsHistoryLimit }}
        </el-descriptions-item>
        <el-descriptions-item label="Keep the number of failed tasks">
          {{ instance.spec.failedJobsHistoryLimit }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="instance.spec.startingDeadlineSeconds"
          label="Task start deadline"
        >
          {{ instance.spec.startingDeadlineSeconds }}
        </el-descriptions-item>
      </template>
      <el-descriptions-item label="Label">
        <div :class="$style.tagWrap">
          <el-tag
            v-for="label in instance.metadata.labels"
            :key="label.key"
            type="info"
            :title="label.key + ':' + label.value"
          >
            {{ label.key }}: {{ label.value }}
          </el-tag>
        </div>
      </el-descriptions-item>
      <!-- ??? -->
      <el-descriptions-item label="Annotation">
        <div :class="$style.tagWrap">
          <el-tag
            v-for="label in instance.metadata.annotations"
            :key="label.key"
            type="info"
            :title="label.key + ':' + label.value"
          >
            {{ label.key }}: {{ label.value }}
          </el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="['deployments', 'statefulsets'].includes(workload) "
        label="Instance"
      >
        <div v-if="workload === 'deployments'">
          {{ instance.status.desired }} desired,
          {{ instance.status.updated }} updated,
          {{ instance.status.available }} available,
          {{ instance.status.unavailable }} unavailable,
          {{ instance.status.total }} total
        </div>
        <div v-if="workload === 'statefulsets'">
          {{ instance.status.desired }} desired,
          {{ instance.status.total }} total
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        label="Tag selector"
        :column="1"
      >
        <div :class="$style.tagWrap">
          <el-tag
            v-for="label in instance.spec.matchLabels"
            :key="label.key"
            type="info"
            :title="label.key + ':' + label.value"
          >
            {{ label.key }}: {{ label.value }}
          </el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item
        v-if="workload === 'daemonsets'"
        label="Level"
      >
        {{ instance.spec.level.ind === 'platform' ? 'platform level' : '' }}
        {{ instance.spec.level.ind === 'tenant' ? instance.spec.level.tenant : '' }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="workload === 'deployments'"
        label="Update strategy"
      >
        <template v-if="instance.spec.strategy.type === 'RollingUpdate'">
          RollingUpdate, maxSurge:{{ instance.spec.strategy.maxSurge }},maxUnavailable:{{ instance.spec.strategy.maxUnavailable }}
        </template>
        <template v-else>
          {{ instance.spec.strategy.type }}
        </template>
      </el-descriptions-item>
      <template v-if="workload === 'statefulsets'">
        <el-descriptions-item label="Service Name">
          {{ instance.spec.serviceName }}
        </el-descriptions-item>
        <el-descriptions-item label="Storage declaration template">
          {{ instance.spec.volumeClaimTemplates.enable ? instance.spec.volumeClaimTemplates.templates.map(i => i.name).join(','): '-' }}
        </el-descriptions-item>
      </template>

      <template v-if="workload === 'jobs'">
        <el-descriptions-item label="Status">
          <statusIcon :name="instance.status.runningStatus | getJobStatusIcon" /> {{ instance.status.runningStatus | getJobStatusText }}
        </el-descriptions-item>
        <el-descriptions-item label="Expected number of successful executions">
          {{ instance.spec.completions }}
        </el-descriptions-item>
        <el-descriptions-item label="Parallel number">
          {{ instance.spec.parallelism }}
        </el-descriptions-item>
        <el-descriptions-item label="Overtime time">
          {{ instance.spec.activeDeadlineSeconds === undefined ? '-' : instance.spec.activeDeadlineSeconds + 'second' }}
        </el-descriptions-item>
        <el-descriptions-item label="Number of retries">
          {{ instance.spec.backoffLimit }}
        </el-descriptions-item>
      </template>
    </el-descriptions>
    <el-descriptions
      title="Deploy template"
      :column="1"
    >
      <el-descriptions-item label="Container">
        {{ instance.containers.map(c => c.containerName).join(',') }}
      </el-descriptions-item>
      <el-descriptions-item label="Label">
        <div :class="$style.tagWrap">
          <el-tag
            v-for="label in instance.podTemplate.metadata.labels"
            :key="label.key"
            type="info"
            :title="label.key + ':' + label.value"
          >
            {{ label.key }}: {{ label.value }}
          </el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="Restart strategy">
        {{ instance.podTemplate.spec.restartPolicy }}
      </el-descriptions-item>
    </el-descriptions>
    <template v-if="workload !== 'cronjobs'">
      <el-descriptions
        title="Condition"
        :column="1"
      />
      <el-table
        :data="instance.status.conditions"
        style="width: 100%"
      >
        <el-table-column
          prop="condition"
          label="Condition"
          :show-overflow-tooltip="true"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.type }}: {{ row.status }}
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
          label="Message"
        >
          <template slot-scope="{ row }">
            {{ row.message }}
          </template>
        </el-table-column>
        <el-table-column
          prop="lastchecktime"
          label="Last detection time"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.lastUpdateTime | formatLocaleTime }}
          </template>
        </el-table-column>
        <el-table-column
          prop="lastchangetime"
          label="Last conversion time"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.lastTransitionTime | formatLocaleTime }}
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import {
    JOB_STATUS_MAP,
} from 'kubeworkz';
import statusIcon from 'kubeworkz/elComponent/status-icon.vue';
export default {
    components: {
        statusIcon,
    },
    filters: {
        getJobStatusIcon(status = 'Pending') {
            return (JOB_STATUS_MAP[status] || JOB_STATUS_MAP.Pending).icon;
        },
        getJobStatusText(status = 'Pending') {
            return (JOB_STATUS_MAP[status] || JOB_STATUS_MAP.Pending).text;
        },
    },
    props: {
        instance: Object,
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
    },
    methods: {
        viewYAML() {
            this.$editResource({
                title: `${this.instance.metadata.name} —— View YAML`,
                content: this.instance.puresource,
                editorOption: {
                    readOnly: true,
                },
            });
        },
    },
};
</script>

<style module>
.message {
    word-break: break-word;
    white-space: break-spaces;
}
/* .root :global(.el-tag+.el-tag){
  margin-left: 10px;
} */
.tagWrap {
  display: flex;
  flex-wrap: wrap;
}
.tagWrap :global(.el-tag) {
  margin-right: 4px;
  margin-bottom: 4px;
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 800px;
}
</style>
