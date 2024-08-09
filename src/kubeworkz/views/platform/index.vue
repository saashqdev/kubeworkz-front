<template>
  <div :class="$style.root">
    <aside :class="['g-side', $style.nav]">
      <div class="g-sidebar">
        <u-sidebar collapsible>
          <u-sidebar-header
            label="Operation and maintenance management"
          />

          <u-sidebar-group
            class="m-sidebar-group"
          >
            <span slot="title"><u-icons name="member" />Organizational management</span>
            <u-sidebar-item
              v-if="isPlatform"
              :to="{ path: '/platform/user' }"
            >
              User management
            </u-sidebar-item>
            <u-sidebar-item :to="{ path: '/platform/role' }">
              Role management
            </u-sidebar-item>
            <u-sidebar-item :to="{ path: '/platform/bootstrap' }">
              Quick guide
            </u-sidebar-item>
            <u-sidebar-item
              v-if="isPlatform || isTenant"
              :to="{ path: '/platform/tenant' }"
            >
              Tenant management
            </u-sidebar-item>
            <u-sidebar-item
              v-if="(isTenant || isProject) && !isPlatform"
              :to="{ path: '/platform/tenant/project' }"
            >
              Project management
            </u-sidebar-item>
          </u-sidebar-group>
          <u-sidebar-group
            class="m-sidebar-group"
          >
            <span slot="title"><u-icons name="ncs" />Resource management</span>
            <u-sidebar-item
              v-if="isPlatform"
              :to="{ path: '/platform/quota' }"
            >
              Tenant quota
            </u-sidebar-item>
            <u-sidebar-item :to="{ path: '/platform/cluster' }">
              Cluster management
            </u-sidebar-item>
            <u-sidebar-item :to="{ path: '/platform/nsquota' }">
              Namespace management
            </u-sidebar-item>
          </u-sidebar-group>
          <u-sidebar-group
            v-if="isPlatform && showControlOperation"
            class="m-sidebar-group"
          >
            <span slot="title"><u-icons name="cluster" />Control operation and maintenance</span>
            <!-- <u-sidebar-item>
              Component monitoring
            </u-sidebar-item>
            <u-sidebar-item>
              Component alert
            </u-sidebar-item>
            <u-sidebar-item>
              Component log
            </u-sidebar-item> -->
            <u-sidebar-item
              v-if="auditFeature && auditEnable"
              :to="{ path: '/platform/audit' }"
            >
              Operational audit
            </u-sidebar-item>
          </u-sidebar-group>
          <u-sidebar-item :to="{ path: '/platform/monitor' }">
            <u-icons name="monitor" />Component monitoring
          </u-sidebar-item>
          <u-sidebar-group
            v-if="isPlatform"
            class="m-sidebar-group"
          >
            <span slot="title"><u-icons name="config" />Alert</span>
            <u-sidebar-item
              :to="{ path: '/platform/PrometheusRule' }"
            >
              Alert rules
            </u-sidebar-item>
            <u-sidebar-item
              :to="{ path: '/platform/AlertmanagerConfig' }"
            >
              Global alert configuration
            </u-sidebar-item>
          </u-sidebar-group>
        </u-sidebar>
      </div>
    </aside>
    <div :class="$style.container">
      <div :class="$style.content">
        <u-app-bread-crumbs relative="platform" />
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import uAppBreadCrumbs from 'kubeworkz/component/global/u-app-bread-cumbs.vue';
import auditService from 'kubeworkz/services/audit';
import {
    ROLES,
} from 'kubeworkz';

export default {
    metaInfo: {
        title: 'Operation and maintenance management - kubeworkz',
    },

    components: {
        uAppBreadCrumbs,
    },
    data() {
        return {
            auditEnable: false,
        };
    },
    computed: {
        auditFeature: get('feature/features@audit'),
        userRole: get('scope/userRole'),
        globalLoading: get('scope/loading'),
        isPlatform() {
            return this.userRole[ROLES.PLATFORM_ADMIN];
        },
        isTenant() {
            return this.userRole[ROLES.TENANT_ADMIN];
        },
        isProject() {
            return this.userRole[ROLES.PROJECT_ADMIN];
        },
        showControlOperation() {
            return this.auditFeature && this.auditEnable;
        },
    },
    watch: {
        globalLoading(val) {
            console.log(val);
        },
    },
    created() {
        this.isAuditEnable();
    },
    mounted() {
        if (this.$route.path === '/platform') {
            this.$router.replace({
                path: this.isPlatform ? '/platform/user' : '/platform/role',
            });
        }
    },
    methods: {
        async isAuditEnable() {
            if (this.auditFeature) {
                this.auditEnable = await auditService.enabled();
            }
        },
    },
};
</script>

<style module>
.root{
    height: 100%;
}
.container{
    position: absolute;
    top: 64px;
    left: 180px;
    right: 0;
    bottom: 0;
    overflow: auto;
    background-color: #fff;
}
.content{
    padding: 40px;
    min-width: 1170px;
}
.full{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav{
    left: 0px;
    top: 64px;
    width: 180px;
    height: calc(100% - 64px);
}
.nav > div {
    position: relative;
    width: 100%;
    height: 100%;
}
.subTitle {
    margin: 10px 0 -5px 20px;
}
</style>
