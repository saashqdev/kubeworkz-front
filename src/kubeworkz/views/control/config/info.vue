<template>
  <div>
    <el-descriptions
      title="Basic Information"
      :column="1"
    >
      <el-descriptions-item :label="`${workloadLiteral} name`">
        {{ instance.metadata.name }}
      </el-descriptions-item>
      <el-descriptions-item label="Cluster name">
        {{ cluster }}
      </el-descriptions-item>
      <el-descriptions-item label="Space">
        {{ namespace }}
      </el-descriptions-item>
      <el-descriptions-item label="Creation time">
        {{ instance.metadata.creationTimestamp | smartDateFormat }}
      </el-descriptions-item>
      <el-descriptions-item
        v-if="workload === 'secrets'"
        label="Type"
      >
        {{ instance.type || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      title="Data"
      :column="1"
    />
    <el-table
      :data="instance.data || []"
      style="width: 100%"
    >
      <el-table-column
        prop="key"
        label="key"
        width="120"
      />
      <el-table-column
        prop="value"
        label="value"
      >
        <template slot-scope="{ row }">
          <enhanceQzEditor
            v-if="workload === 'configmaps'"
            v-model="row.value"
            style="border: 1px solid #E1E8ED"
            height="100"
            theme="vs"
            language="yaml"
            :options="{ minimap: {enabled: false}, readOnly: true }"
          />
          <template v-else>
            {{ row.value }}
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
export default {
    props: {
        instance: Object,
    },
    data() {
        return {
            column: [
                { title: 'key', name: 'key', textwrap: true, width: '120px' },
                { title: 'value', name: 'value', textwrap: true },
            ],
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        workloadLiteral() {
            switch (this.workload) {
                case 'configmaps':
                    return 'Configmap';
                case 'secrets':
                    return 'Secret';
                default:
                    return '';
            }
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
