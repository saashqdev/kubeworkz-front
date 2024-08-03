<template>
  <aside :class="['g-side', $style.root]">
    <div class="g-sidebar">
      <u-sidebar collapsible>
        <u-sidebar-header
          label="Console"
        />
        <div style="margin-bottom: 12px;">
          <div :class="$style.subTitle">
            Cluster
          </div>
          <div :class="$style.subTitle">
            <u-app-cluster-select />
          </div>
          <div :class="$style.subTitle">
            Space
          </div>
          <div :class="$style.subTitle">
            <u-app-namespace-select />
          </div>
        </div>
        <u-sidebar-divider />

        <u-sidebar-group
          expanded
          class="m-sidebar-group"
        >
          <span slot="title"><u-icons name="dashboard" />Overview</span>
          <u-sidebar-item
            :to="{ path: '/control/dashboard' }"
          >
            Resource monitoring
          </u-sidebar-item>
          <!-- <u-sidebar-item :to="{ path:`/panel/index` }">
            Dashboard
          </u-sidebar-item> -->
        </u-sidebar-group>
        <u-sidebar-divider />
        <div style="margin-left: 3px;">
          <div :class="$style.subTitleblock">
            Application Center
          </div>
        </div>
        <u-sidebar-group
          class="m-sidebar-group"
        >
          <span slot="title"><u-icons name="workload" />Workload</span>
          <u-sidebar-item
            :to="{ path: '/control/deployments' }"
          >
            Deployments
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/statefulsets' }"
          >
            Statefulsets
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/daemonsets' }"
          >
            Daemonsets
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/cronjobs' }"
          >
            CronJob
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/jobs' }"
          >
            Job
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/pods' }"
          >
            Pods
          </u-sidebar-item>
        </u-sidebar-group>
        <u-sidebar-group class="m-sidebar-group">
          <span slot="title"><u-icons name="serverFinder" />Service and discovery</span>
          <u-sidebar-item :to="{ path: '/control/services' }">
            Services
          </u-sidebar-item>
          <u-sidebar-item :to="{ path: '/control/ingresses' }">
            Ingresses
          </u-sidebar-item>
          <!-- <u-sidebar-item>
            LoadBalancer
          </u-sidebar-item> -->
        </u-sidebar-group>
        <u-sidebar-item :to="{ path: '/control/persistentvolumeclaims' }">
          <u-icons name="volume" />Storage
        </u-sidebar-item>
        <u-sidebar-group class="m-sidebar-group">
          <span slot="title"><u-icons name="config" />Configuration</span>
          <u-sidebar-item
            :to="{ path: '/control/secrets' }"
          >
            Secret
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/configmaps' }"
          >
            ConfigMap
          </u-sidebar-item>
        </u-sidebar-group>
        <u-sidebar-item @click="() => $yamlDialog.open()">
          <u-icons name="yaml" />YAML Orchestration
        </u-sidebar-item>
        <u-sidebar-item :to="{ path: '/control/crd' }">
          <u-icons name="yaml" />Custom Resource CRD
        </u-sidebar-item>
        <u-sidebar-item @click="openCloudShell">
          <u-icons name="cloud-shell" />Cloud Shell
        </u-sidebar-item>
        <u-sidebar-item :to="{ path: '/control/bootstrap' }">
          <u-icons name="alarmRule" />Common Tool
        </u-sidebar-item>

        <u-sidebar-divider />
        <div style="margin-left: 3px;">
          <div :class="$style.subTitleblock">
            Operation and Maintenance Center
          </div>
        </div>
        <u-sidebar-group v-if="logseerFeatures" class="m-sidebar-group">
          <span slot="title"><u-icons name="config" />Logs</span>
          <u-sidebar-item
            :to="{ path: '/control/logconfigs' }"
          >
            Log Task Management
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/lens/normal' }"
            @click="toLog"
          >
            Log Query
          </u-sidebar-item>
        </u-sidebar-group>

        <u-sidebar-group class="m-sidebar-group">
          <span slot="title"><u-icons name="config" />Alerts</span>
          <u-sidebar-item
            :to="{ path: '/control/PrometheusRule' }"
          >
            Alert Rules
          </u-sidebar-item>
          <u-sidebar-item
            :to="{ path: '/control/AlertmanagerConfig' }"
          >
            Alert Policy Group
          </u-sidebar-item>
          <!-- <u-sidebar-item
            :to="{ path: '/control/lens/alarmhistory' }"
          >
            Alert History
          </u-sidebar-item> -->
        </u-sidebar-group>
      </u-sidebar>
    </div>
    <!-- <yaml-dialog ref="yamlDialog" /> -->
  </aside>
</template>

<script>
import { get, sync } from 'vuex-pathify';
import uAppClusterSelect from './header/u-app-cluster-select.vue';
import uAppNamespaceSelect from './header/u-app-namespace-select.vue';
export default {
    components: {
        uAppClusterSelect,
        uAppNamespaceSelect,
    },
    computed: {
        namespace: sync('scope/namespace'),
        cluster: sync('scope/cluster'),
        logseerFeatures: get('feature/features@logseer'),
        query: get('query'),
        // dashboard{ title: 'specialTerms.Dashboard', to: this.makeRoute("/dashboard"), icon: 'mdi-view-dashboard' },
        workloads() {
            return [

                // If you have a cluster, you must use makeRoute
                // { title: 'specialTerms.User', to: { path: "/user" }, icon: 'mdi-account-details' },
                { title: 'Deployments', to: this.makeRoute('/deployments') },
                { title: 'Statefullsets', to: this.makeRoute('/statefullsets') },
                { title: 'CronJob', to: this.makeRoute('/cronjob') },
            ];
        },
    },
    methods: {
        makeRoute(path) {
            return {
                path,
                query: this.query,
            };
        },
        openCloudShell() {
            this.$kubeterm();
        },
        toLog() {
            this.$store.dispatch('lens/setToDefault');
            this.$store.commit('like/RESET');
            this.$store.dispatch('timer/setTimer');
        },
    },

};
</script>

<style module>
.root{
    left: 0px;
    top: 64px;
    width: 180px;
    height: calc(100% - 64px);
}
.root > div {
    position: relative;
    width: 100%;
    height: 100%;
}
.subTitle {
    margin: 10px 0 0px 12px;
}
.subTitleblock{
    padding: 10px;
    font-size: 1.05em;
}
</style>
