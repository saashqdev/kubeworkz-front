<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout
        direction="horizontal"
        class="kube-clear"
      >
        <template v-if="isPlatform || isTenant">
          <u-button
            icon="create"
            color="primary"
            @click="openCreateModal"
          >
            Add new items
          </u-button>

          <u-button
            icon="refresh"
            square
            @click="refresh"
          />
        </template>
        <kube-pipe
          ref="tenantpipe"
          key="project"
          style="float: right;"
          component="u-linear-layout"
          graph="tenant"
          direction="horizontal"
          @pipestatechange="pipeLoading = $event"
        >
          <u-text>Tenant</u-text>
          <kube-tenant-select v-model="tenant" />
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
                <u-link-list-item @click="addMember(item)">
                  Add member
                </u-link-list-item>
                <u-link-list-item @click="editInfo(item)">
                  Modify name
                </u-link-list-item>
                <u-link-list-item @click="editDomainSuffix(item)">
                  Modify name
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #noData>
              There are no projects yet, now
              <u-link @click="openCreateModal">
                Create now
              </u-link>
              Just one.
            </template>
            <template #error>
              Failed to obtain data, please<u-link @click="refresh">
                Try again
              </u-link>
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
    <project-dialog
      ref="dialog"
      @refresh="refresh"
    />
    <member-dialog
      ref="memberdialog"
      @refresh="refresh"
    />
    <domainSuffixDialog
      ref="domainSuffixDialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import userService from 'kubeworkz/services/user';
import PageMixin from 'kubeworkz/mixins/pagination';
import projectDialog from './project-dialog.vue';
import memberDialog from './member-dialog.vue';
import kubeTenantSelect from 'kubeworkz/component/global/common/kube-tenant-select.vue';
import {
    toPlainObject,
} from 'kubeworkz/k8s-resources/scope/project';
import {
    ROLES,
} from 'kubeworkz/utils/constants';
import domainSuffixDialog from './dialogs/domainSuffix.vue';
export default {
    components: {
        projectDialog,
        kubeTenantSelect,
        memberDialog,
        domainSuffixDialog,
    },
    metaInfo: {
        title: 'Project - kubeworkz',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            tenant: null,
            pipeLoading: true,
            service: userService.getUserProjects,
            columns: [
                { name: 'spec.displayName', title: 'Project name' },
                { name: 'metadata.name', title: 'Project ID' },
                { name: 'tenant', title: 'Owned tenant' },
                { name: 'metadata.creationTimestamp', title: 'Creation time', width: '200px' },
                { name: 'operation', title: 'Operation', width: '220px' },
            ],
            list: [],
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
        userRole: get('scope/userRole'),
        isPlatform() {
            return this.userRole[ROLES.PLATFORM_ADMIN];
        },
        isTenant() {
            return this.userRole[ROLES.TENANT_ADMIN];
        },
        isProject() {
            return this.userRole[ROLES.PROJECT_ADMIN];
        },
        params() {
            console.log(this.tenant);
            return {
                params: {
                    user: this.user,
                    tenant: getFunc(this.tenant, 'value'),
                },
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
            console.log(result, getFunc(result, 'items', []));
            const r = {
                list: (getFunc(result, 'items') || []).map(i => toPlainObject(i)),
                total: getFunc(result, 'total', 0),
            };
            console.log(r);
            this.list = r.list;
            return r;
        },
        refresh(tenant) {
            this.$refs.request.request();
            if (tenant && typeof tenant === 'string') {
                this.tenant = {
                    value: tenant,
                };
            }
        },
        addMember(item) {
            console.log(item);
            this.$refs.memberdialog.open({
                tenant: {
                    value: item.tenant,
                },
                project: {
                    value: item.metadata.name,
                },
            }, 'project');
        },
        editInfo(item) {
            this.$refs.dialog.open(item);
        },
        openCreateModal() {
            this.$refs.dialog.open();
            console.log(this.$refs.user);
        },
        editDomainSuffix(item) {
            this.$refs.domainSuffixDialog.open(item);
        },

    },

};
</script>

<style>

</style>
