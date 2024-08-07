<template>
  <div>
    <el-form ref="form" :model="model" :rules="rules" label-position="right" label-width="140px">
      <dynamicTab
        v-model="model.containers"
        validateFile="containers"
        :initialAdd="true"
        :minCount="1"
        :miniFormatter="(item, index) => {
          return `Configuration-${index + 1}`
        }"
        :getDefaultItem="getDefaultContainer"
      >
      <template slot-scope="{item, index}">
        <el-form-item
          label="Container name"
          :prop="`containers.${index}.containerName`"
          :rules="[
            { required: true, message: 'Name is required'},
            validators.k8sResourceNameValidator(),
          ]"
        >
          <el-input v-model="item.containerName" placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"/>
        </el-form-item>
        <el-form-item
          label="Image"
          :prop="`containers.${index}.image`"
          :rules="[
            { required: true, message: 'Image cannot be empty'},
          ]"
        >
          <div style="display:flex">
            <el-input v-model="item.image"/>
          </div>
        </el-form-item>
        <div style="position:relative">
          <x-request
            ref="request"
            :service="resourceQuotaService"
            :params="{
              namespaceInfo,
              cluster,
              tenant,
              project
            }"
          > 
          <template slot-scope="{ data }">
            <div :class="$style.remainResourceInfo">
              <template v-if="data">
                <div :class="$style.remainType">
                  Space quota remaining:
                </div>
                <div :class="$style.remainType">
                  <div :class="$style.title">
                    Request:
                  </div>
                  <div :class="$style.content">
                    <span :class="$style.value">CPU: {{data.requests.cpu}} Cores</span><span :class="$style.value">Memory: {{data.requests.memory}} MiB</span><span :class="$style.value">GPU: {{data.requests.gpu}} Cores</span>
                  </div>
                </div>
                <div :class="$style.remainType">
                  <div :class="$style.title">
                    Upper limit:
                  </div>
                  <div :class="$style.content">
                    <span :class="$style.value">CPU: {{data.limits.cpu}} Cores</span><span :class="$style.value">Memory: {{data.limits.memory}} MiB</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div>Space quota remaining</div>
                <div :class="$style.remainType">
                  <div :class="$style.title">
                    Request:
                  </div>
                  <div :class="$style.content">
                    <span :class="$style.value">CPU: -- Cores</span><span :class="$style.value">Memory: -- MiB</span><span :class="$style.value">GPU: -- GiB</span>
                  </div>
                </div>
                <div :class="$style.remainType">
                  <div :class="$style.title">
                    Upper limit:
                  </div>
                  <div :class="$style.content">
                    <span :class="$style.value">CPU: -- Cores</span><span :class="$style.value">Memory: -- MiB</span>
                  </div>
                </div>
              </template>
            </div>
          </template>
          </x-request>
        </div>
        <resource-config v-model="item.resources" />
        <el-form-item>
          <el-link @click="item.showAdvanced = !item.showAdvanced" type="primary">
            {{ item.showAdvanced ? 'Collapse more configurations' : 'Expand more configurations' }}
          </el-link>
        </el-form-item>
        <div v-show="item.showAdvanced">
          <volumes-config
            v-model="item.volumes"
            :pod-volumes="model.podTemplate.spec.volumes"
            :open-dialog="openEmpryDirDialog"
            :error-prefix="`containers.${index}.volumes`"
            :storage="model.spec.volumeClaimTemplates && model.spec.volumeClaimTemplates.templates"
            :image="item.image"
          />
          <env-config
            v-model="item.env"
            :containers="model.containers"
            :error-prefix="`containers.${index}.env`"
          />
          <el-form-item
            :prop="`containers.${index}.type`"
            :rules="[
              validators.someValueRequired(containerTypeList, 'normal'),
            ]"
          >
            <template slot="label">
              Container type
              <el-tooltip effect="dark" content="The init container does not support readiness probes and must be able to terminate. A pod can have multiple init containers, which will be executed sequentially before the business container is run." placement="right" popper-class="ncs-el-tooltip-popper">
                <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
              </el-tooltip>
            </template>
            <el-radio-group v-model="item.type">
              <el-radio-button v-for="typeItem in containerTypes" :label="typeItem.value" :key="typeItem.value">{{typeItem.text}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="Start command"
          >
            <div style="color: #999;">
              Common usage
              <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
                <div slot="content">
                  <div>1. Use environment variables</div>
                    <div> [Order] /bin/echo</div>
                    <div> [Parameter] $(ENVNAME)</div>
                    <div>Note: ENVNAME is the Key value defined in the environment variable</div>
                    <div style="margin-top: 10px;">
                      2. Run shell command
                    </div>
                    <div> [Order] /bin/sh</div>
                    <div> [Parameter]</div><div style="padding-left: 20px;">
                      -c
                    </div>
                    <div style="padding-left: 20px;">
                      while true; do echo hello; sleep 10; done
                    </div>
                </div>
                <i class="el-icon-question"/>
              </el-tooltip>
            </div>
            <qz-editor
              style="border: 1px solid #E1E8ED"
              height="160"
              width="580"
              v-model="item.command"
              theme="vs"
              language="shell"
              :options="{ minimap: {enabled: false} }"
            />
          </el-form-item>
          <el-form-item
            label="Start command parameters"
          >
            <qz-editor
              style="border: 1px solid #E1E8ED"
              height="160"
              width="580"
              v-model="item.args"
              theme="vs"
              language="shell"
              :options="{ minimap: {enabled: false} }"
            />
          </el-form-item>
          <probe-config
            v-if="item.type === 'normal'"
            v-model="item.probe.liveness"
            :prefixKey="`containers.${index}.probe.liveness`"
            probe="LivenessProbe"
            key="LivenessProbe"
          />
          <probe-config
            v-if="item.type === 'normal'"
            v-model="item.probe.readiness"
            :prefixKey="`containers.${index}.probe.readiness`"
            probe="ReadyProbe"
            key="ReadyProbe"
          />

          <probe-config
            v-if="item.type === 'normal'"
            v-model="item.probe.preStop"
            :prefixKey="`containers.${index}.probe.preStop`"
            probe="LifePreStopProbe"
            key="LifePreStopProbe"
          />
          <probe-config
            v-if="item.type === 'normal'"
            v-model="item.probe.postStart"
            :prefixKey="`containers.${index}.probe.postStart`"
            probe="LifePostStopProbe"
            key="LifePostStopProbe"
          />
          <port-config
            v-model="item.ports"
            :prefixKey="`containers.${index}.ports`"
            key="ports"
          />
          <el-form-item
            :prop="`containers.${index}.imagePullPolicy`"
            :rules="[
              { required: true, message: 'Image pull policy cannot be empty'},
            ]"
          >
            <template slot="label">
              Image pull strategy
              <el-tooltip effect="dark" placement="right" popper-class="ncs-el-tooltip-popper">
                <div slot="content">
                  Always: Always pull new images again<br/>
                  Never: Never pull new images<br/>
                  IfNotPresent: Default value, the image is pulled only if it does not exist on the host.
                </div>
                <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
              </el-tooltip>
            </template>
            <el-radio-group v-model="item.imagePullPolicy">
              <el-radio-button v-for="policy in imagePullPolicyList" :label="policy.value" :key="policy.value">{{policy.text}}</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>
      </template>
      </dynamicTab>
      <el-form-item>
        <el-button type="primary" @click="$emit('go', -1)">Previous</el-button>
        <el-button type="primary" @click="handleNextStep">Next step</el-button>
      </el-form-item>
    </el-form>
    <empty-dir-dialog
      ref="emptyDir"
      :pod-volumes="model.podTemplate.spec.volumes"
      @change="onChangeEmptyDir"
    />
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import { getDefaultContainer } from 'kubeworkz/k8s-resources/container';
import resourceConfig from './resource-config.vue';
import volumesConfig from './volumes-config.vue';
import emptyDirDialog from './volumes/emptydir-dialog.vue';
import envConfig from './env-config.vue';
import probeConfig from './probe-config.vue';
import portConfig from './port-config.vue';
import { get, sync } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toResourceQuotaPlainObject,
} from 'kubeworkz/k8s-resources/resourceQuota/index.js';
import dynamicTab from 'kubeworkz/elComponent/dynamic-tab.vue/index.vue';
import * as validators from 'kubeworkz/utils/validators';

export default {
    components: {
        resourceConfig,
        volumesConfig,
        emptyDirDialog,
        // pathInput,
        envConfig,
        probeConfig,
        portConfig,
        dynamicTab,
    },
    mixins: [ makeVModelMixin ],
    data() {
        return {
            validators,
            rules: {

            },
            containerTypes: [
                { text: 'Business container', value: 'normal' },
                { text: 'Init container', value: 'init' },
            ],
            imagePullPolicyList: [
                { value: 'Always', text: 'Always' },
                { value: 'Never', text: 'Never' },
                { value: 'IfNotPresent', text: 'IfNotPresent' },
            ],
            showSelectImageModal: false,
            currentContainerModel: null,
        };
    },
    computed: {
        containerTypeList() {
            return this.model.containers.map(c => c.type);
        },
        cluster: get('scope/cluster@value'),
        tenant: sync('scope/tenant@value'),
        project: sync('scope/project@value'),
        namespaceInfo: sync('scope/namespace@metadata'),
        clusterHarborAddr: get('scope/cluster@harborAddr'),
    },
    methods: {
        async handleNextStep() {
            // Trigger verification
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.$emit('go', 1);
        },
        getDefaultContainer,
        onChangeEmptyDir(list) {
            this.$set(this.model.podTemplate.spec.volumes, 'emptyDir', list);
        },
        openEmpryDirDialog() {
            this.$refs.emptyDir.open();
        },
        openNewWindow(link) {
            const routeData = this.$router.resolve(link);
            window.open(routeData.href, '_blank');
        },
        handleValidate() {
            this.$refs.observer.validate();
        },
        openSelectImageModal(containerModel) {
            this.currentContainerModel = containerModel;
            this.showSelectImageModal = true;
        },
        changeCurrentContainerModelImage(val) {
            this.currentContainerModel.image = val;
        },
        async resourceQuotaService(params) {
            const { namespaceInfo, cluster, tenant, project } = params;
            if (namespaceInfo && cluster && tenant && project) {
                const namespace = namespaceInfo.name;
                const res = await workloadService.getAPIV1Instance({
                    pathParams: {
                        cluster,
                        namespace,
                        resource: 'resourcequotas',
                        name: `${cluster}.${tenant}.${project}.${namespace}`,
                    },
                    noAlert: true,
                });
                if (res.kind === 'ResourceQuota') {
                    const status = toResourceQuotaPlainObject(res).status;
                    console.log(status);
                    return {
                        requests: {
                            cpu: (status.hard.cpu - status.used.cpu).toFixed(2),
                            memory: (status.hard.memory - status.used.memory).toFixed(2),
                            gpu: (status.hard.gpu - status.used.gpu).toFixed(2),
                        },
                        limits: {
                            cpu: (status.hard.limitsCpu - status.used.limitsCpu).toFixed(2),
                            memory: (status.hard.limitsMemory - status.used.limitsMemory).toFixed(2),
                        },
                    };
                }
                return null;
            }
        },
    },
};
</script>

<style module>
.errTip {
    color: $brand-error;
    padding-left: 10px;
}
.question::after {
    font-size: 16px;
    color: #FF4D4F;
    icon-font: url('kubeworkz/assets/question.svg');
    cursor: pointer;
}
.selectImageBtn{
  margin-left: 8px;
}

.remainResourceInfo{
    min-width: 230px;
    background: inherit;
    background-color: rgba(247, 248, 253, 1);
    position: absolute;
    top: 40px;
    left: 750px;
    padding: 14px;
    font-size: 14px;
    /* display: flex;
    flex-direction: column;
    justify-content: space-between; */
}
.remainResourceInfo .remainType {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}
.remainResourceInfo .remainType .title {
  flex-grow: 0;
  flex-shrink: 0;
}
.remainResourceInfo .remainType .content {

}
.value {
    display: inline-block;
    padding: 0 8px;
}
</style>
