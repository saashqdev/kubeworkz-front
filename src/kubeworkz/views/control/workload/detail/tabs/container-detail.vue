<template>
  <div>
    <headCard
      :title="containerName"
    />
    <el-tabs
      value="0"
      page="main"
    >
      <el-tab-pane
        label="Details"
        :name="0"
      />
    </el-tabs>
    <div v-if="message">
      {{ message }}
    </div>
    <div v-else>
      <el-button
        type="primary"
        style="margin-bottom: 20px;"
        @click="viewYAML"
      >
        Check the detail information
      </el-button>
      <el-descriptions
        title="Basic Information"
        :column="1"
      >
        <el-descriptions-item label="Name">
          {{ container.containerName }}
        </el-descriptions-item>
        <el-descriptions-item label="Mirror">
          {{ container.image }}
        </el-descriptions-item>
        <el-descriptions-item label="Image pull strategy">
          {{ container.imagePullPolicy }}
        </el-descriptions-item>
        <el-descriptions-item
          label="Resource limits"
          content-style="display:block"
          label-style="align-self: flex-start;"
        >
          <div>
            <el-table
              :data="resourceData"
              style="width: 100%;"
            >
              <el-table-column
                prop="type"
                label=""
                :show-overflow-tooltip="true"
              />
              <el-table-column
                prop="cpu"
                label="CPU"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                prop="memory"
                label="MEMORY"
                :show-overflow-tooltip="true"
              />
            </el-table>
          </div>
        </el-descriptions-item>
        <el-descriptions-item
          label="Mount data volume"
          content-style="display:block"
          label-style="align-self: flex-start;"
        >
          <div>
            <el-table
              :data="volumes"
              style="width: 100%;"
            >
              <el-table-column
                prop="name"
                label="Storage statement"
                :show-overflow-tooltip="true"
              />
              <el-table-column
                prop="mountPath"
                label="Mount point"
                :show-overflow-tooltip="true"
              />
            </el-table>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toPodPlainObject,
} from 'kubeworkz/k8s-resources/pod/index.js';
import {
    toPlainObject as toDepPlainObject,
} from 'kubeworkz/k8s-resources/deployment/index.js';
import { CONTAINERTYPE } from 'kubeworkz';

export default {
    filters: {
        getContainerIcon(type) {
            return (CONTAINERTYPE[type] || {}).icon || 'container';
        },
    },
    data() {
        return {
            instance: {},
            container: {},
            resourceData: [],
            volumes: [],
            message: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        name() {
            return this.$route.params.instance;
        },
        workload() {
            return this.$route.params.workload;
        },
        podName() {
            return this.$route.params.pod;
        },
        containerName() {
            return this.$route.params.container;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: this.name,
                },
            };
        },
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
                },
                params: {
                    // labelSelector: this.instance.spec.matchLabels.map(l => `${l.key}=${l.value}`).join(','),
                    selector: this.instance.spec.matchLabels.map(l => `metadata.labels.${l.key}=${l.value}`).join(','),
                },
            };
        },
    },
    created() {
        this.load();
    },

    methods: {
        async load() {
            try {
                const res = await (this.workload === 'jobs' ? workloadService.getBatchInstance : workloadService.getInstance)(this.requestParam);
                this.instance = toDepPlainObject(res);
                const response = await workloadService.getAPIV1(this.params);
                const target = (response.items || []).find(d => d.metadata.name === this.podName);
                const containers = getFunc(toPodPlainObject(target), 'containers', []);
                this.container = containers.find(c => c.containerName === this.containerName);
                const resource = this.container.raw.resources;
                this.resourceData = [
                    { type: 'requests', cpu: getFunc(resource, 'requests.cpu', '-'), memory: getFunc(resource, 'requests.memory', '-') },
                    { type: 'limits', cpu: getFunc(resource, 'limits.cpu', '-'), memory: getFunc(resource, 'limits.memory', '-') },
                ];
                this.volumes = this.container.raw.volumeMounts;
                console.log(this.container);
            } catch (err) {
                this.message = 'Container does not exist';
            }
        },
        getContainerText(type) {
            return (CONTAINERTYPE[type] || {}).text || 'Business container';
        },
        getContainer(data) {
            data = data || [];
            const target = data.find(d => d.metadata.name === this.podName);
            return getFunc(target, 'containers', []);
        },
        viewYAML() {
            this.$editResource({
                title: `${this.container.containerName} —— View YAML`,
                content: this.container.raw,
                editorOption: {
                    readOnly: true,
                },
            });
        },
    },
};
</script>

<style module>
.button {
    margin-bottom: 20px;
}
</style>
