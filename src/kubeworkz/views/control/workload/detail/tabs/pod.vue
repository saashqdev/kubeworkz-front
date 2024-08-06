<template>
  <x-request
    ref="request"
    :service="podService"
    :params="{}"
    :processor="resolver"
    :poll="{ interval: 8000 }"
  >
    <template slot-scope="{ data, loading }">
      <el-descriptions title="Basic Information" :column="1" />
      <el-table
        v-loading="loading"
        :data="data || []"
        style="width: 100%"
      >
        <el-table-column
          prop="metadata.name"
          label="Metadata name"
          :show-overflow-tooltip="true"
        ></el-table-column>
        <el-table-column
          prop="status.phase"
          label="Replica status"
          :show-overflow-tooltip="true"
          width="80"
        ></el-table-column>
        <el-table-column
          prop="status.podIP"
          label="IP"
          :show-overflow-tooltip="true"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="status.hostIP"
          label="Node IP"
          :show-overflow-tooltip="true"
          width="100"
        >
          <template slot-scope="{ row }">
            <el-link type="primary" @click="toNode(row)">
              {{ row.status.hostIP }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="status.restartCount"
          label="Number of restarts"
          :show-overflow-tooltip="true"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="creationTimestamp"
          label="Creation time"
          :show-overflow-tooltip="true"
          width="180"
        >
          <template slot-scope="{ row }">
            {{ row.metadata.creationTimestamp | formatLocaleTime }}
          </template>
        </el-table-column>
        <el-table-column
          prop="operation"
          label="Operation"
          width="200"
        >
          <template slot-scope="{ row }">
            <el-link type="primary" @click="viewYAML(row)" style="marginRight:10px">
              Check the detail information
            </el-link>
            <el-link type="primary" @click="toEvent(row)" style="marginRight:10px">
              View events
            </el-link>
            <el-link type="primary" @click="deleteItem(row)" :disabled="isReview">
              Delete
            </el-link>
          </template>
        </el-table-column>
      </el-table>
      <el-descriptions title="Container details" :column="1" />
      <div style="marginBottom: 12px">
        <span style="margin-right: 8px; line-height: 32px;">Pod: </span>
        <el-select
          key="list"
          v-model="podName"
          style="width:440px"
        >
          <el-option
            v-for="item in (data || [])"
            :key="item.value"
            :label="item.text"
            :value="item.value"
            :title="item.text"
          />
        </el-select>
      </div>
      <el-table
        v-loading="loading"
        :data="getContainer(data || [])"
        style="width: 100%"
      >
        <el-table-column
          prop="containerName"
          label="Container name"
          :show-overflow-tooltip="true"
        >
          <template slot-scope="{ row }">
            <el-tooltip effect="dark" :content="getContainerText(row.type)" placement="top" popper-class="ncs-el-tooltip-popper">
              <u-icons
                style="color: #508de8;"
                :name="row.type | getContainerIcon"
              />
            </el-tooltip>
            <el-link
              type="primary"
              :to="{ path: `/control/${$route.params.workload}/${$route.params.instance}/${podName}/${row.containerName}`, query: $route.query }"
            >
              {{ row.containerName }}
            </el-link>
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
            <el-link type="primary" @click="$termModal.open('container', { cluster, namespace, pod: podName, container: row.containerName })" style="marginRight:10px">
              Console
            </el-link>
            <el-link type="primary" @click="toLog(row)">
              View log
            </el-link>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </x-request>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import { podService } from 'kubeworkz/service-combined/pod-service.js';
import {
    toPlainObject as toPodPlainObject,
} from 'kubeworkz/k8s-resources/pod/index.js';
import { CONTAINERTYPE } from 'kubeworkz';
export default {
    filters: {
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
                { title: 'Metadata name', name: 'metadata.name' },
                { title: 'Replica status', name: 'status.phase', width: '80px' },
                { title: 'IP', name: 'status.podIP', width: '100px' },
                { title: 'Node IP', name: 'status.hostIP', width: '100px' },
                { title: 'Number of restarts', name: 'status.restartCount', width: '100px' },
                { title: 'Creation time', name: 'creationTimestamp', width: '180px' },
                { title: 'Operation', name: 'operation', width: '200px' },
            ],
            podName: null,
            containerColumns: [
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
        controlClusterList: get('scope/controlClusterList'),
        userRole: get('scope/userRole'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            return !this.userResourcesPermission['pods'];
        },
        podService() {
            return podService({
                workload: this.workload,
                cluster: this.cluster,
                namespace: this.namespace,
                uid: this.instance.metadata.uid,
            });
        },
        workload() {
            return this.$route.params.workload;
        },
    },

    methods: {
        toNode(item) {
            const href = window.location.origin + `#/platform/cluster/${this.cluster}/${item.spec.nodeName}/info`;
            window.open(href, '_blank');
        },
        getContainerText(type) {
            return (CONTAINERTYPE[type] || {}).text || 'Business container';
        },
        resolver(response) {
            const items = (response.items || []).map(r => {
                const pod = toPodPlainObject(r);
                return {
                    text: pod.metadata.name,
                    value: pod.metadata.name,
                    ...pod,
                };
            });
            console.log(items);
            const target = items.find(item => item.value === this.podName);
            if (!target) {
                this.podName = getFunc(items, '[0].value');
            }
            return items;
        },
        getContainer(data) {
            data = data || [];
            const target = data.find(d => d.metadata.name === this.podName);
            return getFunc(target, 'containers', []);
        },
        toEvent(item) {
            this.$router.push({ name: 'control.workload.event', params: this.$route.params, query: {
                kind: 'pod',
                pod: item.metadata.name,
                type: 'current',
            } });
        },
        toLog(container) {
            this.$router.push({
                name: 'control.workload.log',
                params: this.$route.params,
                query: {
                    podName: this.podName,
                    containerName: container.containerName,
                },
            });
        },
        async deleteItem(item) {
            this.$eConfirm({
                title: 'Delete',
                message: `Confirm to delete ${item.metadata.name}?`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'pods',
                            name: item.metadata.name,
                        },
                    };
                    await workloadService.deleteAPIV1Instance(reqParam);
                    this.$refs.request.request();
                },
            });


        },
        async viewYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'pods',
                    name: item.metadata.name,
                },
            };
            const response = await workloadService.getAPIV1Instance(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— View YAML`,
                content: response,
                editorOption: {
                    readOnly: true,
                },
            });
        },
    },
};
</script>

<style module>
.gap > *{
    margin-top: 20px;
}
</style>
