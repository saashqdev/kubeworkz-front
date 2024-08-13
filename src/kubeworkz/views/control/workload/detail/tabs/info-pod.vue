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
      <el-descriptions-item label="Pod name">
        {{ instance.metadata.name }}
      </el-descriptions-item>
      <el-descriptions-item label="Cluster name">
        {{ cluster }}
      </el-descriptions-item>
      <el-descriptions-item label="Namespace">
        {{ namespace }}
      </el-descriptions-item>
      <el-descriptions-item label="Creation time">
        {{ instance.metadata.creationTimestamp | smartDateFormat }}
      </el-descriptions-item>
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
      <el-descriptions-item label="Belonging node">
        {{ instance.spec.nodeName }}
      </el-descriptions-item>
      <el-descriptions-item label="Termination grace period">
        {{ instance.spec.terminationGracePeriodSeconds }}s
      </el-descriptions-item>
      <el-descriptions-item label="Restart strategy">
        {{ instance.spec.restartPolicy }}
      </el-descriptions-item>
      <el-descriptions-item label="Condition">
        {{ instance.status.conditions | conditionFilter }}
      </el-descriptions-item>
      <el-descriptions-item label="Controller">
        {{ ((instance.metadata.ownerReferences || [])[0] || {}).name }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      title="Container"
      :column="1"
    />
    <el-table
      :data="instance.containers"
      style="width: 100%"
    >
      <el-table-column
        prop="containerName"
        label="Container name"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            effect="dark"
            :content="getContainerText(row.type)"
            placement="top"
            popper-class="ncs-el-tooltip-popper"
          >
            <u-icons
              style="color: #508de8;"
              :name="row.type | getContainerIcon"
            />
          </el-tooltip>
          {{ row.containerName }}
        </template>
      </el-table-column>
      <el-table-column
        prop="image"
        label="Image"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="status"
        label="Container status"
        :show-overflow-tooltip="true"
        width="100"
      >
        <template slot-scope="{ row }">
          {{ Object.keys(row.status.state)[0] }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status.restartCount"
        label="Number of restarts"
        :show-overflow-tooltip="true"
        width="100"
      />
      <el-table-column
        prop="operation"
        label="Operation"
        width="160"
      >
        <template slot-scope="{ row }">
          <el-link
            type="primary"
            style="marginRight:10px"
            @click="$termModal.open('container', { cluster, namespace, pod: instance.metadata.name, container: row.containerName })"
          >
            console
          </el-link>
          <el-link
            type="primary"
            @click="toLog(row)"
          >
            View log
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import { CONTAINERTYPE } from 'kubeworkz';

export default {
    filters: {
        conditionFilter(val) {
            [ 'Initialized', 'Ready', 'PodScheduled' ].map(key => {
                const condition = (val || []).find(item => item.type === key);
                return condition ? key + ': ' + condition.status : '';
            }).filter(item => item).join(', ');
        },
        getContainerIcon(type) {
            return (CONTAINERTYPE[type] || {}).icon || 'container';
        },
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            columns: [
                { title: 'Container name', name: 'containerName' },
                { title: 'Image', name: 'image', width: '40%' },
                { title: 'Container status', name: 'status', width: '100px' },
                { title: 'Number of restarts', name: 'status.restartCount', width: '100px' },
                { title: 'Operation', name: 'operation', width: '200px' },
            ],
        };
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
                title: `${this.instance.metadata.name} —— check the detail information`,
                content: this.instance.puresource,
                editorOption: {
                    readOnly: true,
                },
            });
        },
        getContainerText(type) {
            return (CONTAINERTYPE[type] || {}).text || 'Business container';
        },
        toLog(item) {
            this.$router.push({
                name: 'control.workload.log',
                params: this.$route.params,
                query: {
                    podName: this.instance.metadata.name,
                    containerName: item.containerName,
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
