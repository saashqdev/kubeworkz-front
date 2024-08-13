<template>
  <div>
    <template v-if="isInSubRoute">
      <router-view />
    </template>
    <template v-else>
      <div style="margin-bottom: 12px;">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="isReview"
          @click="createCRD"
        >
          Create custom resources
        </el-button>
        <el-button
          square
          icon="el-icon-refresh-right"
          @click="doRefresh"
        />
        <inputSearch
          placeholder="Please enter name to search"
          position="right"
          @search="onSearch"
        />
      </div>
      <el-tabs
        :value="activeTab"
        page="main"
        @tab-click="habdleTabClick"
      >
        <el-tab-pane
          v-for="item in tabs"
          :key="item.value"
          :label="item.title"
          :name="item.value"
        />
      </el-tabs>
      <!-- <u-tabs router>
        <u-tab
          v-for="item in tabs"
          :key="item.title"
          :title="item.title"
          :to="item.route"
        />
      </u-tabs> -->
      <div>
        <router-view
          :refresh-key="refreshKey"
          :selector="selector"
        />
      </div>
    </template>
  </div>
</template>
<script>
import workloadService from 'kubeworkz/services/k8s-resource';
import { get } from 'vuex-pathify';
import inputSearch from 'kubeworkz/elComponent/inputSearch/index.vue';
export default {
    components: {
        inputSearch,
    },
    metaInfo() {
        return {
            title: 'CRD - kubeworkz',
        };
    },
    data() {
        return {
            tabs: [
                { title: 'Cluster level', value: 'Cluster', route: { path: '/control/crd/Cluster' } },
                { title: 'Namespace level', value: 'Namespaced', route: { path: '/control/crd/Namespaced' } },
            ],
            selector: '',
            refreshKey: +new Date(),
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        userResourcesPermission: get('scope/userResourcesPermission'),
        isReview() {
            return !this.userResourcesPermission.customresourcedefinitions;
        },
        reqParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                },
            };
        },
        level() {
            return this.$route.params.level;
        },
        isInSubRoute() {
            return this.$route.name === 'crd.detail';
        },
        activeTab() {
            return this.$route.params.level;
        },
    },
    watch: {
        isInSubRoute() {
            this.selector = '';
        },
    },
    methods: {
        habdleTabClick(tab) {
            console.log(this.$route);
            const target = this.tabs.find(item => item.value === tab.name);
            if (target) {
                this.$router.push({ ...target.route, query: this.$route.query });
            }
        },
        doRefresh() {
            this.refreshKey = +new Date();
        },
        onSearch(content) {
            const temp = content ? `metadata.name~${content}` : undefined;
            if (this.selector === temp) {
                this.doRefresh();
            }
            this.selector = temp;
        },
        createCRD() {
            this.$editResource({
                title: 'Create custom resources',
                content: {
                    apiVersion: 'apiextensions.k8s.io/v1beta1',
                    kind: 'CustomResourceDefinition',
                    metadata: {
                        name: '',
                    },
                    spec: {

                    },
                },
                onSubmit: async content => {
                    console.log(content);
                    await workloadService.createCRD({
                        ...this.reqParam,
                        data: content,
                        noAlert: true,
                    });
                    this.doRefresh();
                },
            });
        },
    },
};
</script>
