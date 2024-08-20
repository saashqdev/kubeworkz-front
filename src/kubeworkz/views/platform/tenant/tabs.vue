<template>
  <div>
    <u-tabs router>
      <u-tab
        v-for="(item, index) in tabs"
        :key="index"
        :value="item"
        :title="item.title"
        :to="{ path: item.path }"
      />
    </u-tabs>
    <div>
      <router-view />
    </div>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import {
    ROLES,
} from 'kubeworkz/utils/constants';
export default {
    data() {
        return {
            tab: {},

        };
    },
    computed: {
        userRole: get('scope/userRole'),
        globalLoading: get('scope/loading'),
        tabs() {
            if (!this.userRole[ROLES.PLATFORM_ADMIN] && !this.userRole[ROLES.TENANT_ADMIN]) {
                return [
                    { title: 'Project', path: '/platform/tenant/project' },
                    { title: 'Member', path: '/platform/tenant/member' },
                ];
            }
            return [
                { title: 'Tenant', path: '/platform/tenant/tenant' },
                { title: 'Project', path: '/platform/tenant/project' },
                { title: 'Member', path: '/platform/tenant/member' },
            ];
        },
    },
};
</script>

<style>

</style>
