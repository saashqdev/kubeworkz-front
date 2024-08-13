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
      <el-descriptions-item label="Service name">
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
      <el-descriptions-item label="Annotate">
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
      <el-descriptions-item label="Tag selector">
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
      <el-descriptions-item label="Type">
        {{ instance.spec.type }}
      </el-descriptions-item>
      <el-descriptions-item label="Cluster IP">
        {{ instance.spec.clusterIP }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="instance.spec.type === 'LoadBalancer'"
        label="IP Type"
      >
        {{ instance.spec.ipTypeText }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="instance.spec.type === 'LoadBalancer'"
        label="Network bandwidth"
      >
        {{ instance.spec.bandWidth }}Mbps
      </el-descriptions-item>
      <el-descriptions-item
        v-if="instance.spec.type === 'ClusterIP' && instance.spec.template === 'external'"
        label="External IP"
      >
        {{ (instance.spec.externalIPs || []).join(', ') }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      title="Service details"
      :column="1"
    >
      <el-descriptions-item label="Domain name">
        {{ instance.spec.host }}
      </el-descriptions-item>
      <el-descriptions-item label="Port">
        <el-table
          :data="instance.spec.ports"
          style="width: 100%"
        >
          <el-table-column
            prop="targetPort"
            label="Target port"
          />
          <el-table-column
            prop="protocol"
            label="Protocol"
          />
          <el-table-column
            prop="port"
            label="Service port"
          />
          <el-table-column
            v-if="instance.spec.type === 'NodePort'"
            prop="nodePort"
            label="NodePort"
          />
          <el-table-column
            prop="name"
            label="Name"
          />
        </el-table>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      title="Copy"
      :column="1"
    />
    <x-request
      ref="request"
      :service="podService"
      :params="params"
      :processor="podResolver"
    >
      <template slot-scope="{ data, loading }">
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
          />
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
          <el-table-column
            prop="operation"
            label="Operation"
            width="180"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              <el-link
                type="primary"
                :to="{ path: `/control/services/${instance.metadata.name}/event`, query: { ...$route.query, kind: 'pod', pod: row.metadata.name } }"
              >
                View events
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </x-request>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
// import workloadService from '@micro-app/ncs/kubeworkz/services/k8s-resource';
import workloadExtendService from 'kubeworkz/services/k8s-extend-resource';
import {
    toPlainObject as toPodPlainObject,
} from 'kubeworkz/k8s-resources/pod/index.js';
export default {
    props: {
        instance: Object,
    },
    data() {
        return {
            // podService: workloadExtendService.getWorkloads,
            podColumn: [
                { title: 'Copy name', name: 'metadata.name' },
                { title: 'Replica status', name: 'status.phase', width: '80px' },
                { title: 'IP', name: 'status.podIP', width: '100px' },
                { title: 'Creation time', name: 'creationTimestamp', width: '180px' },
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
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
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
            if (this.instance.spec.type === 'NodePort') {
                columns.splice(3, 0, { title: 'NodePort', name: 'nodePort', width: '100px' });
            }
            return columns;
        },
    },
    methods: {
        async podService(params) {
            if (!params.params.selector) {
                return {
                    items: [],
                };
            }
            const res = await workloadExtendService.getWorkloads(params);
            return res;
        },
        podResolver(response) {
            const items = (response.items || []).map(toPodPlainObject);
            return items;
        },
        viewYAML() {
            this.$editResource({
                title: `${this.instance.metadata.name} —— Check the detail information`,
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
