<template>
  <div>
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
      <el-descriptions-item label="Store claim name">
        {{ instance.metadata.name }}
      </el-descriptions-item>
      <el-descriptions-item label="State">
        {{ instance.status.phase }}
      </el-descriptions-item>
      <el-descriptions-item label="Persistent storage">
        {{ instance.spec.volumeName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Storage class">
        {{ instance.spec.storageClassName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Capacity">
        {{ instance.spec.resources.requests.storage || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Model">
        {{ instance.spec.accessMode | accessModeFilter }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      title="Associated copy"
      :column="1"
    />
    <x-request
      ref="request"
      :service="podService"
      :params="params"
      :processor="podResolver"
    >
      <template slot-scope="{ data, loading, error }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
        >
          <el-table-column
            prop="metadata.name"
            label="Copy name"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link
                type="primary"
                :to="{path: `/control/pods/${row.metadata.name}/info`, query: $route.query}"
              >
                {{ row.metadata.name }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="status.phase"
            label="Replica status"
            width="80"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="status.podIP"
            label="IP"
            width="100"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.status.podIP || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="status.hostIP"
            label="Node IP"
            :show-overflow-tooltip="true"
            width="100"
          >
            <template slot-scope="{ row }">
              {{ row.status.hostIP || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="creationTimestamp"
            label="Creation time"
            width="180"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.metadata.creationTimestamp | formatLocaleTime }}
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
// import workloadService from 'kubeworkz/services/k8s-resource';
import workloadExtendService from 'kubeworkz/services/k8s-extend-resource';
import {
    toPlainObject as toPodPlainObject,
} from 'kubeworkz/k8s-resources/pod/index.js';
import {
    PVC_MODE_TEXT_MAP,
} from 'kubeworkz';
export default {
    filters: {
        accessModeFilter(val) {
            return PVC_MODE_TEXT_MAP[val] || '-';
        },
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            podService: workloadExtendService.getPVCPods,
            podColumn: [
                { title: 'Copy name', name: 'metadata.name' },
                { title: 'Replica status', name: 'status.phase', width: '80px' },
                { title: 'IP', name: 'status.podIP', width: '100px' },
                { title: 'Node IP', name: 'status.hostIP', width: '100px' },
                { title: 'Number of restarts', name: 'status.restartCount', width: '100px' },
                { title: 'Creation time', name: 'creationTimestamp', width: '180px' },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    pvcName: this.instance.metadata.name,
                },
                params: {
                    pageSize: 10000,
                    // labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
                },
            };
        },
        serviceColumn() {
            const columns = [
                { title: 'Target port', name: 'targetPort', width: '100px' },
                { title: 'Protocol', name: 'protocol', width: '100px' },
                { title: 'Service port', name: 'port', width: '100px' },
                { title: 'Name', name: 'name' },
            ];
            if (this.instance.template === 'nodePort') {
                columns.splice(3, 0, { title: 'NodePort', name: 'nodePort', width: '100px' });
            }
            return columns;
        },
    },
    methods: {
        podResolver(response) {
            const items = (response.pods || []).map(toPodPlainObject);
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
</style>
