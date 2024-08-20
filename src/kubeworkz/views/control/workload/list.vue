<template>
  <div>
    <el-row :class="$style.root">
      <el-row>
        <el-col>
          <el-button
            type="primary"
            icon="el-icon-plus"
            :disabled="isReview"
            @click="toCreate"
          >
            Deploy
          </el-button>
          <el-button
            square
            icon="el-icon-refresh-right"
            @click="refresh"
          />
          <elInputSearch
            v-model="filterName"
            placeholder="Please enter name to search"
            position="right"
            @search="onSearch"
          />
        </el-col>
      </el-row>
      <el-row>
        <x-request
          ref="request"
          :service="service"
          :params="requestParam"
          :processor="resolver"
        >
          <template slot-scope="{ data, loading }">
            <el-table
              :key="workload"
              v-loading="loading"
              :data="data ? data.list : []"
              style="width: 100%"
              border
              :default-sort="defaultSort"
              @sort-change="tableSortChange"
            >
              <template v-if="['statefulsets', 'deployments'].includes(workload)">
                <el-table-column
                  prop="metadata.name"
                  label="Name"
                  :show-overflow-tooltip="true"
                  sortable
                >
                  <template slot-scope="{ row }">
                    <el-link
                      :to="{ path: `/control/${workload}/${row.metadata.name}/info`, query: $route.query }"
                      type="primary"
                    >
                      {{ row.metadata.name }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="date"
                  label="Image"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ calculateImages(row) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="date"
                  label="Status"
                  :width="workload === 'deployments' ? 360 : 180"
                >
                  <template slot="header">
                    Status
                    <el-tooltip
                      class="item"
                      effect="dark"
                      placement="top"
                      popper-class="ncs-el-tooltip-popper"
                    >
                      <div
                        v-if="workload === 'deployments'"
                        slot="content"
                      >
                        <div>Workload status gives status statistics of each copy of the workload</div>
                        <div>desired: expected number of copies</div>
                        <div>updated: the number of copies that are already the latest version</div>
                        <div>available: number of available copies</div>
                        <div>unavailable: number of unavailable replicas</div>
                        <div>total: total number of copies</div>
                      </div>
                      <div
                        v-if="workload === 'statefulsets'"
                        slot="content"
                      >
                        <div>Status information gives the status statistics of the replica</div>
                        <div>desired: expected number of copies</div>
                        <div>total: total number of copies</div>
                      </div>
                      <i class="el-icon-question" />
                    </el-tooltip>
                  </template>
                  <template slot-scope="{ row }">
                    <statusIcon
                      v-if="getStatus(row) === 'success'"
                      name="success"
                    />
                    <statusIcon
                      v-else-if="!row.podStatus.warning || !row.podStatus.warning.length"
                      name="warning"
                    />
                    <el-tooltip
                      v-else
                      class="item"
                      effect="dark"
                      placement="top"
                      popper-class="ncs-el-tooltip-popper"
                    >
                      <div
                        v-if="row.podStatus.warning && row.podStatus.warning.length"
                        slot="content"
                      >
                        <div
                          v-for="(warn, idx) in row.podStatus.warning"
                          :key="idx"
                        >
                          {{ warn.message }}
                        </div>
                      </div>
                      <statusIcon name="warning" />
                    </el-tooltip>
                    {{ row.status | statusFilter(workload) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="metadata.creationTimestamp"
                  label="Creation time"
                  width="170"
                  sortable
                >
                  <template slot-scope="{ row }">
                    {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="Operation"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="toEditItem(row)"
                      >
                        Set up
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="resize(row)"
                      >
                        Adjust the number of copies
                      </el-link>
                      <el-link
                        v-if="workload === 'deployments'"
                        :disabled="isReview"
                        type="primary"
                        @click="toUpdateImage(row)"
                      >
                        Rolling update
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="restart(row)"
                      >
                        Rebuild
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="deleteItem(row)"
                      >
                        Delete
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="editYAML(row)"
                      >
                        YAML settings
                      </el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </template>
              <template v-if="['daemonsets'].includes(workload)">
                <el-table-column
                  prop="metadata.name"
                  label="Name"
                  :show-overflow-tooltip="true"
                  sortable
                >
                  <template slot-scope="{ row }">
                    <el-link
                      :to="{ path: `/control/${workload}/${row.metadata.name}/info`, query: $route.query}"
                      type="primary"
                    >
                      {{ row.metadata.name }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="level"
                  label="Level"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ row.spec.level && (row.spec.level.ind === 'platform' ? 'Platform level' : 'Tenant level') || '-' }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="metadata.creationTimestamp"
                  label="Creation time"
                  width="170"
                  sortable
                >
                  <template slot-scope="{ row }">
                    {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="Operation"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="toEditItem(row)"
                      >
                        Set up
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="deleteItem(row)"
                      >
                        Delete
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="editYAML(row)"
                      >
                        YAML settings
                      </el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </template>
              <template v-if="['cronjobs'].includes(workload)">
                <el-table-column
                  prop="metadata.name"
                  label="Name"
                  :show-overflow-tooltip="true"
                  sortable
                >
                  <template slot-scope="{ row }">
                    <el-link
                      :to="{ path: `/control/${workload}/${row.metadata.name}/info`, query: $route.query }"
                      type="primary"
                    >
                      {{ row.metadata.name }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status.runningStatus"
                  label="Status"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ row.spec.suspend ? 'Suspended' : 'Started' }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="spec.schedule"
                  label="Timing settings"
                  :show-overflow-tooltip="true"
                />
                <el-table-column
                  prop="status.tasks"
                  label="Number of running tasks"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ (row.status.active || []).length }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="metadata.creationTimestamp"
                  label="Creation time"
                  width="170"
                  sortable
                >
                  <template slot-scope="{ row }">
                    {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="Action"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="toEditItem(row)"
                      >
                        Set up
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="deleteItem(row)"
                      >
                        Delete
                      </el-link>
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="editYAML(row)"
                      >
                        YAML settings
                      </el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </template>
              <template v-if="['jobs'].includes(workload)">
                <el-table-column
                  prop="metadata.name"
                  label="Name"
                  :show-overflow-tooltip="true"
                  sortable
                >
                  <template slot-scope="{ row }">
                    <el-link
                      :to="{ path: `/control/${workload}/${row.metadata.name}/info`, query: $route.query }"
                      type="primary"
                    >
                      {{ row.metadata.name }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="Status"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ row.status | statusFilter(workload) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="jobstatus"
                  label="Execution status (complete/all)"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ row.status.succeeded || 0 }} / {{ row.spec && row.spec.completions }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="period"
                  label="Running time"
                  :show-overflow-tooltip="true"
                >
                  <template slot-scope="{ row }">
                    {{ getJobPeriod(row) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="metadata.creationTimestamp"
                  label="Creation time"
                  width="170"
                  sortable
                >
                  <template slot-scope="{ row }">
                    {{ row.metadata.creationTimestamp | formatLocaleTime }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="action"
                  label="Action"
                  width="180"
                >
                  <template slot-scope="{ row }">
                    <qz-link-group max="3">
                      <el-link
                        type="primary"
                        :disabled="isReview"
                        @click="deleteItem(row)"
                      >
                        Delete
                      </el-link>
                    </qz-link-group>
                  </template>
                </el-table-column>
              </template>
            </el-table>
            <el-pagination
              v-if="data && calculatePages(data.total) > 0"
              style="float:right;margin-top:12px"
              :current-page="pagination.pageNum"
              :page-sizes="[10, 20, 30, 40, 50, 100]"
              :page-size="pagination.pageSize"
              layout="total, sizes, prev, pager, next"
              :total="data.total"
              background
              @size-change="pageSizeChange"
              @current-change="pageNumChange"
            />
          </template>
        </x-request>
      </el-row>
    </el-row>
    <modify-replicas-dialog
      ref="modifyDialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { upperFirst } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import workloadExtendService from 'kubeworkz/services/k8s-extend-resource';
import { toPlainObject as toDeploymentPlainObject } from 'kubeworkz/k8s-resources/deployment';
import { toPlainObject as toStatefulsetPlainObject } from 'kubeworkz/k8s-resources/statefulset';
import { toPlainObject as toDaemonsetPlainObject } from 'kubeworkz/k8s-resources/daemonsets';
import { toPlainObject as toJobPlainObject } from 'kubeworkz/k8s-resources/job';
import { toPlainObject as toCronJobPlainObject } from 'kubeworkz/k8s-resources/cronjob';
// import { toPlainObject as toMetadataPlainObject } from 'kubeworkz/k8s-resources/metadata';
import modifyReplicasDialog from './detail/dialog/modify-replicas.vue';
import { paginationMixin } from 'kubeworkz/mixins';

import {
    JOB_STATUS_MAP,
} from 'kubeworkz/utils/constants';
import {
    getPeriod,
} from 'kubeworkz/utils/functional';
export default {
    metaInfo() {
        return {
            title: `${this.workload} - kubeworkz`,
        };
    },
    components: {
        modifyReplicasDialog,
    },
    filters: {
        statusFilter(status, workload) {
            switch (workload) {
                case 'deployments':
                    return `${status.desired} desired, ${status.updated} updated, ${status.available} available, ${status.unavailable} unavailable, ${status.total} total`;
                case 'statefulsets':
                    return `${status.desired} desired, ${status.total} total`;
                case 'jobs':
                    return (JOB_STATUS_MAP[status.runningStatus] || JOB_STATUS_MAP.Pending).text;
                default:
                    return '-';
            }

        },
    },
    mixins: [ paginationMixin ],
    data() {
        return {
            filterName: '',
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userRole: get('scope/userRole'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            return !this.userResourcesPermission[this.workload];
        },
        workload() {
            return this.$route.params.workload;
        },
        workloadLiteral() {
            return upperFirst(this.$route.params.workload);
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                },
                params: {
                    ...this.pagination, // has to be this
                },
            };
        },
        columns() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                    return [
                        { title: 'Name', name: 'name', sortable: true },
                        { title: 'Status', name: 'status', width: '360px' },
                        { title: 'Creation time', name: 'creationTimestamp', width: '200px', sortable: true },
                        { title: 'Operation', name: 'operation', sortable: false, width: '200px' },
                    ];
                case 'daemonsets':
                    return [
                        { title: 'Name', name: 'name', sortable: true },
                        { title: 'Level', name: 'level', width: '320px' },
                        { title: 'Creation time', name: 'creationTimestamp', width: '200px', sortable: true },
                        { title: 'Operation', name: 'operation', sortable: false, width: '200px' },
                    ];
                case 'jobs':
                    return [
                        { title: 'Name', name: 'name', sortable: true },
                        { title: 'Status', name: 'status', width: '160px' },
                        { title: 'Execution status (complete/all)', name: 'jobstatus', width: '200px', sortable: true },
                        { title: 'Running time', name: 'period', width: '160px', sortable: true },
                        { title: 'Operation', name: 'operation', sortable: false, width: '100px' },
                    ];
                case 'cronjobs':
                    return [
                        { title: 'Name', name: 'name', sortable: true },
                        { title: 'Namespace', name: 'metadata.namespace', width: '160px' },
                        { title: 'Status', name: 'status.runningStatus', width: '80px' },
                        { title: 'Schedule scheduling settings', name: 'spec.schedule', width: '120px' },
                        { title: 'Number of running tasks', name: 'status.tasks', width: '120px' },
                        { title: 'Creation time', name: 'creationTimestamp', width: '160px' },
                        { title: 'Operation', name: 'operation', width: '160px' },
                    ];
                default:
                    return [];
            }
        },
        toPlainObject() {
            switch (this.workload) {
                case 'deployments':
                    return toDeploymentPlainObject;
                case 'statefulsets':
                    return toStatefulsetPlainObject;
                case 'jobs':
                    return toJobPlainObject;
                case 'cronjobs':
                    return toCronJobPlainObject;
                case 'daemonsets':
                    return toDaemonsetPlainObject;
                default:
                    return () => ({});
            }
        },
        // toStatuPlainObject() {
        //     switch (this.workload) {
        //         case 'deployments':
        //             return toDeploymentStatusPlainObject;
        //         case 'statefulsets':
        //             return toStatefulsetStatusPlainObject;
        //         case 'jobs':
        //             return toJobStatusPlainObject;
        //         default:
        //             return () => ({});
        //     }
        // },
        service() {
            switch (this.workload) {
                case 'deployments':
                    return workloadExtendService.getWorkloads;
                case 'statefulsets':
                    return workloadService.getWorkloads;
                case 'jobs':
                    return workloadService.getBatchs;
                case 'cronjobs':
                    return workloadService.getBatchsBeta;
                default:
                    return workloadService.getWorkloads;
            }
        },
        createInstanceService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.createWorkload;
                case 'jobs':
                    return workloadService.createBatchs;
                case 'cronjobs':
                    return workloadService.createBatchsBeta;
                default:
                    return null;
            }
        },
        instanceService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.getInstance;
                case 'jobs':
                    return workloadService.getBatchInstance;
                case 'cronjobs':
                    return workloadService.getBatchsBetaInstance;
                case 'pods':
                    return workloadService.getAPIV1Instance;
                default:
                    return null;
            }
        },
        deleteService() {
            switch (this.workload) {
                case 'deployments':
                case 'statefulsets':
                case 'daemonsets':
                    return workloadService.deleteInstance;
                case 'jobs':
                    return workloadService.deleteBatchInstance;
                case 'cronjobs':
                    return workloadService.deleteBatchsBetaInstance;
                case 'pods':
                    return workloadService.deleteAPIV1Instance;
                default:
                    return null;
            }
        },
        // modifyService() {
        //     switch (this.workload) {
        //         case 'deployments':
        //         case 'statefulsets':
        //             return workloadService.modifyWorkload;
        //         case 'jobs':
        //             return workloadService.getBatchInstance;
        //         case 'cronjobs':
        //             return workloadService.getBatchsBetaInstance;
        //         case 'pods':
        //             return workloadService.getAPIV1Instance;
        //         default:
        //             return null;
        //     }
        // },
    },
    watch: {
        columns() {
            this.$refs.request.resetData();
        },
    },
    methods: {
        toUpdateImage(item) {
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/updateImage`,
            });
        },
        async restart(item) {
            await workloadService.patchWorkload({
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: item.metadata.name,
                },
                data: {
                    spec: {
                        template: {
                            metadata: {
                                annotations: {
                                    'kubectl.kubernetes.io/restartedAt': `${new Date().toLocaleString()}`,
                                },
                            },
                        },
                    },
                },
            });
            this.$message({
                message: 'Rebuild triggered',
                type: 'success',
            });
            this.refresh();
        },
        calculateImages(item) {
            return item.containers.map(item => item.image).join(', ');
        },
        getStatus(item) {
            console.log(item.status);
            if ((item.podStatus.warning || []).length > 0 || item.status.desired !== item.status.readyReplicas) { return 'warning'; }
            if (item.podStatus.pending > 0) { return 'waiting'; }
            return 'success';
        },
        getJobPeriod(item) {
            let period = '';
            if (item.status && item.status.startTime) {
                const { startTime, completionTime } = item.status;
                period = completionTime ? getPeriod(startTime, completionTime) : getPeriod(startTime);
            }
            return period;

        },
        resolver(response) {
            console.log(response);

            return {
                list: (response.items || []).map(this.toPlainObject),
                total: response.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        onSort({ order, name }) {
            this.pagination.sortOrder = order;
            this.pagination.sortName = `metadata.${name}`;
            this.pagination.sortFunc = name === 'creationTimestamp' ? 'time' : 'string';
        },
        onSearch(content) {
            this.pagination.selector = content ? `metadata.name~${content}` : undefined;
        },
        toCreate() {
            this.$router.push({
                path: `/control/${this.workload}/create`,
            });
        },
        toEditItem(item) {
            this.$router.push({
                path: `/control/${this.workload}/${item.metadata.name}/edit`,
            });
        },
        resize(item) {
            this.$refs.modifyDialog.open(item);
        },
        deleteItem(item) {
            this.$eConfirm({
                title: 'Delete',
                message: `Confirm to delete ${item.metadata.name}?`,
                ok: async () => {
                    const reqParam = {
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: this.workload,
                            name: item.metadata.name,
                        },
                    };
                    await this.deleteService(reqParam);
                    this.$refs.request.request();
                },
            });
        },
        async editYAML(item) {
            const reqParam = {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: this.workload,
                    name: item.metadata.name,
                },
            };
            const response = await this.instanceService(reqParam);

            this.$editResource({
                title: `${item.metadata.name} —— YAML settings`,
                content: response,
                onSubmit: async content => {
                    console.log(content);
                    await workloadService.modifyWorkload({
                        ...reqParam,
                        data: content,
                    });
                    this.refresh();
                },
            });
        },
    },
};
</script>

<style module>
.podStatus{
    display: block;
}
.podStatus{
    display: block;
}
.root :global(.el-row) + :global(.el-row) {
  margin-top: 12px;
}
</style>
