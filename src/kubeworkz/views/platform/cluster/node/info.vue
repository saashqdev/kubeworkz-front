<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button
        type="primary"
        @click="viewYAML"
      >
        Check the detail information
      </el-button>
    </div>
    <el-descriptions title="Basic Information" :column="1">
      <el-descriptions-item label="Node name">
        {{ instance.metadata.name }}
      </el-descriptions-item>
      <el-descriptions-item label="Cluster name">
        {{ clusterName }}
      </el-descriptions-item>
      <el-descriptions-item label="Creation time">
        {{ instance.metadata.creationTimestamp | formatLocaleTime }}
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
      <el-descriptions-item label="Taint">
        <div :class="$style.tagWrap">
          <el-tag type="info" v-for="(taint, idx) in instance.spec.taints" :key="idx" :title="`effect=${taint.effect}, ${taint.key}=${taint.value}`">{{ `effect=${taint.effect}, ${taint.key}=${taint.value}` }}</el-tag>
        </div>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="Operating environment" :column="1">
      <el-descriptions-item label="Kernel version">
        {{ instance.status.nodeInfo.kernelVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="Operating system image">
        {{ instance.status.nodeInfo.osImage }}
      </el-descriptions-item>

      <el-descriptions-item label="Container runtime version">
        {{ instance.status.nodeInfo.containerRuntimeVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="kubelet version">
        {{ instance.status.nodeInfo.kubeletVersion }}
      </el-descriptions-item>
      <el-descriptions-item label="kubeproxy version">
        {{ instance.status.nodeInfo.kubeProxyVersion }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
export default {
    props: {
        instance: Object,
    },
    computed: {
        clusterName() {
            return this.$route.params.name;
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
