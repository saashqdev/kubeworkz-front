<template>
  <div>
    <u-info-list-group
      title="Basic Information"
      column="1"
      label-size="large"
    >
      <u-info-list-item label="Log task name">
        {{ instance.name }}
      </u-info-list-item>
      <u-info-list-item label="Creation time">
        {{ instance.createTime | formatLocaleTime }}
      </u-info-list-item>
      <u-info-list-item label="cluster/namespace">
        {{ cluster }}/{{ namespace }}
      </u-info-list-item>
      <u-info-list-item label="Tag selector">
        <span
          v-for="label in instance.labelSelector"
          :key="label.key"
          class="u-chip"
          :title="label.key + ':' + label.value"
        >{{ label.key }}: {{ label.value }}</span>
      </u-info-list-item>
    </u-info-list-group>
    <u-info-list-group
      v-if="instance.inputs.length > 0"
      title="Advanced configuration"
      column="1"
      label-size="large"
    >
      <kube-list-block
        v-for="(input, idx) in instance.inputs"
        :key="idx"
      >
        <template slot="breif">
          Log collection path: {{ input.paths.map(p => p.path).join(', ') }}
        </template>
        <u-info-list-item
          v-if="input.paths.length"
          label="Log collection path"
        >
          {{ input.paths.map(p => p.path).join(', ') }}
        </u-info-list-item>
        <u-info-list-item
          v-if="input.containerName"
          label="Container name"
        >
          {{ input.containerName }}
        </u-info-list-item>
        <u-info-list-item
          v-if="input.matchFields.length > 0"
          label="Meta information/Injection Pod tag"
        >
          <kube-table
            table-width="100%"
            :columns="[
              { title: 'Type', name: 'type' },
              { title: 'Key', name: 'key' }]"
            :items="input.matchFields"
          />
        </u-info-list-item>
        <u-info-list-item
          v-if="input.fields.length > 0"
          label="Meta information/custom tags"
        >
          <kube-table
            table-width="100%"
            :columns="[
              { title: 'key', name: 'key' },
              { title: 'value', name: 'value' }]"
            :items="input.fields"
          />
        </u-info-list-item>
        <u-info-list-item
          v-if="input.multiline"
          label="Log multi-line configuration"
        >
          <kube-table
            table-width="100%"
            :columns="[
              { title: 'active', name: 'active' },
              { title: 'pattern', name: 'pattern' }
            ]"
            :items="[input.multiline]"
          />
        </u-info-list-item>
        <u-info-list-item
          v-if="input.excludeFiles.length"
          label="Exclude logs"
        >
          {{ input.excludeFiles.map(p => p.path).join(', ') }}
        </u-info-list-item>
        <u-info-list-item
          v-if="input.ignoreOlder"
          label="Ignore log file duration"
        >
          {{ input.ignoreOlder.num }} {{ input.ignoreOlder.unit }}
        </u-info-list-item>
        <u-info-list-item
          v-if="input.cleanLogs && (input.cleanLogs.retainDays || input.cleanLogs.retainDays === 0)"
          label="Log retention"
        >
          {{ input.cleanLogs.retainDays }} 天
        </u-info-list-item>
      </kube-list-block>
    </u-info-list-group>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import { LOG_TYPE } from 'kubeworkz';
export default {
    filters: {
        logType(val) {
            return LOG_TYPE[val];
        },
        modeUnitFilter(val) {
            if (val === 'retainNum') {
                return 'Unit';
            }
            return 'Day';
        },
        modeFilter(val) {
            if (val === 'retainNum') {
                return 'Number of files to keep';
            }
            return 'Keep time';
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
};
</script>

<style module>
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
