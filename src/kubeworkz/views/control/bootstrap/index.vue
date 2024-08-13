<template>
  <div>
    <el-alert
      title="Platform administrators can manage container cluster resources through the kubectl client"
      type="info"
      description="Can manage authorized resources"
      show-icon
      :closable="false"
    />
    <section :class="$style.section">
      <div :class="$style.title">
        1. Confirm that the kubectl client has been installed locally (adapted to version 1.9 and above)
      </div>
    </section>
    <section :class="$style.section">
      <div :class="$style.title">
        2. Download the required configuration files
      </div>
      <div :class="$style.content">
        <el-button
          type="primary"
          @click="download"
        >
          Download configuration file
        </el-button>
      </div>
    </section>
    <section :class="$style.section">
      <div :class="$style.title">
        3. Place the configuration file config in the .kube directory and execute kubectl config view to check whether the configuration takes effect.
      </div>
      <div :class="$style.content">
        If the configuration file name is modified to another name, when using kubectl, specify the configuration file used by --kubeconfig=&lt;fullname&gt;
      </div>
    </section>

    <!-- <u-section title="2. Download the required configuration files" />
    <u-section title="3. Place the configuration file config in the .kube directory and execute kubectl config view to check whether the configuration takes effect.">
      <div :class="$style.wrap">
        If the configuration file name is modified to another name, when using kubectl, specify the configuration file used by --kubeconfig=&lt;fullname&gt;
      </div>
    </u-section> -->
    <!-- <u-section title="4. Create and manage resources using Kubectl"> -->
    <!-- <div :class="$style.wrap">
        Kubeworkz Container Cloud logically isolates resources by adding additional information to resources, such as distinguishing tenants and projects. When creating resources through the web side, Container Cloud has automatically added the corresponding information for you. However, when creating resources through the kubectl client, we cannot automatically add this information. Therefore, labels information needs to be added manually when using it.
        <p>Specific information is as follows:</p>
        <div>system/tenant=&lt;Tenant ID&gt;></div>
        <div>ssystem/&lt;project identification>=true&gt;</div>
        <div>system/namespace=&lt;space name&gt;</div>
      </div>
      <p>Available settings</p>
      <u-linear-layout direction="vertical">
        <u-linear-layout>
                    <span>Tenant</span>
                    <u-select v-if="tenants.length" v-model="tenantId" :data="tenants"></u-select>
                    <u-select v-else disabled :data="emptyTenant"></u-select>
                    <span>Project</span>
                    <u-select v-if="projects.length" v-model="projectId" :data="projects"></u-select>
                    <u-select v-else disabled :data="emptyProject"></u-select>
                </u-linear-layout>
                <u-table-view :data="list" :loading="!nsLoaded" layout="fixed">
                    <u-table-view-column title="Tenant ID" width="30%" ellipsis>{{ tenantName }}</u-table-view-column>
                    <u-table-view-column title="Project ID" width="30%" ellipsis>{{ projectName }}</u-table-view-column>
                    <u-table-view-column title="Space name" label="name" width="40%" ellipsis></u-table-view-column>
                </u-table-view>
      </u-linear-layout> -->
    <!-- </u-section> -->
  </div>
</template>

<script>
import { get } from 'vuex-pathify';
import userService from 'kubeworkz/services/user';
import { decode } from 'js-base64';
import { readFile } from 'kubeworkz/utils/functional';
export default {
    metaInfo() {
        return {
            title: 'Common tool - kubeworkz',
        };
    },
    data() {
        return {
            clusterIds: [],
        };
    },
    computed: {
        user: get('scope/user@AccountId'),
    },
    methods: {
        async download() {
            const response = await userService.getKubeconfigs({
                params: {
                    user: this.user,
                },
            });
            const content = await readFile(response);
            const ctnt = JSON.parse(content);
            const p = decode(ctnt);
            const filename = 'config.yaml';
            const url = 'data:application/x-yaml;charset=utf-8,' + encodeURIComponent(p);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); // afterwards we remove the element again
        },
    },
};
</script>

<style module>
.wrap {
    background: #f5f7f9;
    padding: 20px;
    word-break: break-all;
}
.wrap > div {
    color: #999;
}
.section {
    margin: 20px 0;
}
.section .content {
        margin: 20px 0 20px 20px;
    max-width: 700px;
}
</style>
