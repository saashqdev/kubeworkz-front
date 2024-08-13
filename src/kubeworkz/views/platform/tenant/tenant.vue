<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout
        v-if="isPlatform"
        direction="horizontal"
      >
        <u-button
          icon="create"
          color="primary"
          @click="openCreateModal"
        >
          Add new tenant
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
      </u-linear-layout>

      <x-request
        ref="request"
        :service="service"
        :params="{
          params: {
            user,
          }
        }"
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
                <u-link-list-item @click="addProject(item)">
                  Add item
                </u-link-list-item>
                <u-link-list-item @click="editInfo(item)">
                  Modify name
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #error>
              Failed to obtain data, please<u-link @click="refresh">
                Try again
              </u-link>
            </template>
            <template #noData>
              There are no tenants yet, right now
              <u-link @click="openCreateModal">
                Create now
              </u-link>
              Just one.
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
    <!-- <comp
      :columns="columns"
      :items="items"
    >
      <template
        #[`item.a`]="{ item }"
      >
        <span>{{ item.a }}</span>
      </template> -->
    <!-- <template
        #[`item.b`]="{ item }"
      >
        {{ item.b }}
      </template> -->
    <!-- </comp> -->
    </u-linear-layout>
    <tenant-dialog
      ref="tenantDialog"
      @refresh="refresh"
    />
    <project-dialog
      ref="projectDialog"
      @refresh="refresh"
    />
    <member-dialog
      ref="memberDialog"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import userService from 'kubeworkz/services/user';
import PageMixin from 'kubeworkz/mixins/pagination';
import tenantDialog from './tenant-dialog.vue';
import projectDialog from './project-dialog.vue';
import memberDialog from './member-dialog.vue';
import {
    ROLES,
} from 'kubeworkz';
// import UserUploadDialog from './user-upload-dialog.vue';
import {
    toPlainObject,
} from 'kubeworkz/k8s-resources/scope/tenant';
export default {
    components: {
        tenantDialog,
        projectDialog,
        memberDialog,
    },
    metaInfo: {
        title: 'Tenant - kubeworkz',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            service: userService.getUserTenants,
            columns: [
                { name: 'spec.displayName', title: 'Name' },
                { name: 'metadata.name', title: 'Logo' },
                { name: 'metadata.creationTimestamp', title: 'Creation time' },
                { name: 'operation', title: 'Operation', width: '200px' },
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
        currentList() {
            const start = (this.pagination.pageNum - 1) * this.pagination.pageSize;
            const end = start + this.pagination.pageSize;
            return this.list.slice(start, end);
        },
    },
    methods: {
        resolver(result) {
            // console.log(result);
            const r = {
                list: (getFunc(result, 'items') || []).map(i => toPlainObject(i)),
                total: getFunc(result, 'total', 0),
            };
            console.log(r);
            this.list = r.list;
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        addMember(item) {
            this.$refs.memberDialog.open({
                tenant: {
                    value: item.metadata.name,
                },
            }, 'tenant');
        },
        addProject(item) {
            this.$refs.projectDialog.openInTenant(item.metadata.name);
        },
        onProjRefresh() {
            this.$router.push('/platform/tenant/project');
        },
        editInfo(item) {
            this.$refs.tenantDialog.open(item);
        },
        openCreateModal() {
            this.$refs.tenantDialog.open();
            console.log(this.$refs.user);
        },

    },

};
</script>

<style>

</style>
