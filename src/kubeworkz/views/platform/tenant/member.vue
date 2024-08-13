<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout direction="horizontal">
        <u-button
          icon="create"
          color="primary"
          @click="addMember"
        >
          Add member
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
        <kube-pipe
          key="member"
          style="float: right;"
          component="u-linear-layout"
          graph="tenant > project > role"
          direction="horizontal"
          @pipestatechange="pipeLoading = $event"
        >
          <u-text>Tenant</u-text>
          <kube-tenant-select v-model="tenant" />
          <u-text>Project</u-text>
          <kube-project-select
            v-model="project"
            :tenant="tenant && tenant.value"
          />
          <u-text>Role</u-text>
          <kube-role-select
            v-model="role"
            :tenant="tenant"
            :project="project"
          />
        </kube-pipe>
      </u-linear-layout>

      <x-request
        v-if="!pipeLoading"
        ref="request"
        :service="service"
        :params="params"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading, error }">
          <kube-table
            table-width="100%"
            :loading="loading"
            :columns="columns"
            :items="currentList"
            :error="error"
          >
            <template #[`item.metadata.creationTimestamp`]="{ item }">
              {{ item.metadata.creationTimestamp | formatLocaleTime }}
            </template>
            <template #[`item.operation`]="{item}">
              <u-link-list>
                <!-- <u-link-list-item @click="modify(item)">
                  Modify permissions
                </u-link-list-item> -->
                <u-link-list-item @click="remove(item)">
                  Remove member
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #noData>
              There are no members yet, so
              <u-link @click="addMember">
                Create now
              </u-link>
              Just one.
            </template>
            <template #error>
              No tenant items selected
            </template>
          </kube-table>
          <u-page
            v-if="data && calculatePages(data.total) > 1"
            :count="data.total"
            :page-size="pagination.pageSize"
            :total="calculatePages(data.total)"
            @select="selectPage"
          />
        </template>
      </x-request>
    </u-linear-layout>
    <member-dialog
      ref="memberdialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get as getFromStore } from 'vuex-pathify';
import userService from 'kubeworkz/services/user';
import roleBindingService from 'kubeworkz/services/role-binding';
import PageMixin from 'kubeworkz/mixins/pagination';
import memberDialog from './member-dialog.vue';
// import UserUploadDialog from './user-upload-dialog.vue';
import {
    toPlainObject,
} from 'kubeworkz/k8s-resources/rolebinding/rolebinding';
import kubeTenantSelect from 'kubeworkz/component/global/common/kube-tenant-select.vue';
import kubeProjectSelect from 'kubeworkz/component/global/common/kube-project-select.vue';
import kubeRoleSelect from 'kubeworkz/component/global/common/kube-role-select.vue';
export default {
    components: {
        memberDialog,
        kubeTenantSelect,
        kubeProjectSelect,
        kubeRoleSelect,
        // UserUploadDialog,
    },
    metaInfo: {
        title: 'Member - kubeworkz',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            tenant: null,
            project: null,
            role: null,
            pipeLoading: true,
            service: roleBindingService.getRoleBindings,
            columns: [
                { name: 'user', title: 'Account' },
                { name: 'role', title: 'Role' },
                { name: 'tenant', title: 'Owned tenant' },
                { name: 'project', title: 'Project' },
                { name: 'metadata.creationTimestamp', title: 'Creation time', width: '200px' },
                { name: 'operation', title: 'Operation', width: '160px' },
            ],
            list: [],
        };
    },
    computed: {
        userRole: getFromStore('scope/userRole'),
        roleList() {
            return this.userRole.clusterRoles.items.map(p => ({
                text: p, value: p,
            }));
        },
        params() {
            const params = {
                selector: `roleRef.name=${this.role.value}`,
            };
            const namespace = getFunc(this.project, 'spec.namespace') || getFunc(this.tenant, 'spec.namespace');
            if (getFunc(this.tenant, 'value')) {
                params.selector += `,metadata.labels.kubeworkz.io/tenant=${this.tenant.value}`;
            }
            if (getFunc(this.project, 'value')) {
                params.selector += `,metadata.labels.kubeworkz.io/project=${this.project.value}`;
            }
            return {
                pathParams: {
                    namespace,
                },
                params,
            };
        },
        currentList() {
            const start = (this.pagination.pageNum - 1) * this.pagination.pageSize;
            const end = start + this.pagination.pageSize;
            return this.list.slice(start, end);
        },
    },
    methods: {
        resolver(result) {
            const r = {
                list: (getFunc(result, 'items') || []).map(i => toPlainObject(i)),
                total: getFunc(result, 'total', 0),
            };
            this.list = r.list;
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        addMember() {
            this.$refs.memberdialog.open({
                tenant: this.tenant,
                project: this.project,
                role: this.role,
            });
        },
        modify(item) {
            console.log(item);
            this.$refs.memberdialog.open({
                tenant: this.tenant,
                project: this.project,
                role: this.role,
                user: item.user,
            });
        },
        remove(item) {
            this.$confirm({
                title: 'Delete',
                content: `Confirm to delete ${item.metadata.name}?`,
                ok: async () => {
                    await userService.deleteRoleBinding({
                        params: {
                            namespace: item.metadata.namespace,
                            name: item.metadata.name,
                        },
                    });
                    this.refresh();
                },
            });
        },
    },

};
</script>

<style>

</style>
