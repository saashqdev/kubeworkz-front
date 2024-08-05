<template>
  <div>
    <el-button
      type="primary"
      style="margin-bottom: 12px"
      @click="viewYAML"
    >
      Check the detail information
    </el-button>
    <el-descriptions title="Basic Information" :column="1">
      <el-descriptions-item label="Load balancing name">
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
          <el-tag type="info" v-for="label in instance.metadata.labels" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="Annotation">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="label in instance.metadata.annotations" :key="label.key" :title="label.key + ':' + label.value">{{ label.key }}: {{ label.value }}</el-tag>
        </div>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="Load balancing details" :column="1">
      <el-descriptions-item label="Rule">
        <el-table
          :data="instance.spec.pathInfos || []"
          style="width: 100%"
        >
          <el-table-column
            prop="url"
            label="Forwarding path"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
          <el-table-column
            prop="service"
            label="Serve"
            :show-overflow-tooltip="true"
          >
          </el-table-column>
        </el-table>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="Associated services" :column="1"/>
    <el-table
      :data="(instance.spec.services || []).map(s => ({ name: s }))"
      style="width: 100%"
    >
      <el-table-column
        prop="name"
        label="Service name"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="operation"
        label="Operation"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{ row }">
          <el-link type="primary" :to="{ path: `/control/services/${row.name}`, query: $route.query }">
            View services
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toPodPlainObject,
} from 'kubeworkz/k8s-resources/pod/index.js';

export default {
    props: {
        instance: Object,
    },
    data() {
        return {
            podService: workloadService.getAPIV1,
            pathColumn: [
                { title: 'Forwarding path', name: 'url' },
                { title: 'Serve', name: 'service', width: '40%' },
            ],
            serviceColumn: [
                { title: 'Service name', name: 'name' },
                { title: 'Operation', name: 'operation', width: '40%' },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
    },
    methods: {
        podResolver(response) {
            const items = (response.items || []).map(toPodPlainObject);
            console.log(items);
            return items;
        },
        viewYAML() {
            this.$editResource({
                title: `${this.instance.metadata.name} —— check the detail information`,
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
