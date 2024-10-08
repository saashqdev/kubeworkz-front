<template>
  <u-modal
    :title="isEdit ? 'Edit alert policy group' : 'Create an alert policy group'"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <kube-form>
        <kube-name-input
          v-model="model.metadata.name"
          :disabled="isEdit"
        />
        <validation-provider
          v-slot="{ errors }"
          name="receivers"
          :rules="{
            someRequired: {list: enableState}
          }"
        >
          <kube-form-item
            label="Method to inform"
            :message="errors && errors[0]"
            name="storage"
            layout="block"
            required
          >
            <kube-tab
              v-model="model.spec.receivers"
              title-key="receiver"
              disabled
            >
              <template slot-scope="{ model: inputsModel }">
                <div
                  :key="inputsModel.receiver"
                  :class="$style.group"
                >
                  <div :class="$style.header">
                    <span>State:</span>
                    <u-switch
                      v-model="inputsModel.enable"
                      :with-text="true"
                    />
                  </div>

                  <kube-dynamic-block
                    v-if="inputsModel.enable"
                    v-model="inputsModel.config"
                    style="width: 100%"
                    :prefix-key="inputsModel.receiver"
                    :layout-comp="blockLayout"
                    :row-comp="blockRowLayout"
                    :column-comp="null"
                    :data-template="() => getDataTemplate(inputsModel.receiver)"
                    button-name="Add to"
                  >
                    <template slot-scope="{ model: row, index }">
                      <kube-form v-if="inputsModel.receiver === 'wechatConfigs'">
                        <kube-form-item
                          label="Whether to accept alert recovery notification"
                          label-size="large"
                        >
                          <u-checkbox
                            v-model="row.sendResolved"
                          />
                        </kube-form-item>
                        <validation-provider
                          v-slot="{ errors }"
                          :name="`wechatConfigs-${index}-to`"
                          :rules="{
                            acceptOne: {
                              values: [row.toUser, row.toParty, row.toTag]
                            }
                          }"
                        >
                          <kube-form-item
                            label="Enterprise WeChat username"
                            layout="list"
                            :message="row.toUser && errors && errors[0]"
                          >
                            <u-input
                              v-model="row.toUser"
                              :color="row.toUser && errors && errors[0] ? 'error' : ''"
                              size="huge"
                            />
                          </kube-form-item>
                          <kube-form-item
                            label="Enterprise WeChat User Group"
                            layout="list"
                            :message="row.toParty && errors && errors[0]"
                          >
                            <u-input
                              v-model="row.toParty"
                              :color="row.toParty && errors && errors[0] ? 'error' : ''"
                              size="huge"
                            />
                          </kube-form-item>
                          <kube-form-item
                            label="Enterprise WeChat user label"
                            layout="list"
                            :message="row.toTag && errors && errors[0]"
                          >
                            <u-input
                              v-model="row.toTag"
                              :color="row.toTag && errors && errors[0] ? 'error' : ''"
                              size="huge"
                            />
                          </kube-form-item>
                        </validation-provider>
                        <u-link @click="row.advanced = !row.advanced">
                          {{ row.advanced ? 'Close' : 'Expand' }}More configurations
                        </u-link>
                        <template v-if="row.advanced">
                          <validation-provider
                            v-slot="{ errors }"
                            :name="`wechatConfigs-${index}-apiURL`"
                            rules="urlpattern"
                          >
                            <kube-form-item
                              label="apiURL"
                              layout="list"
                              :message="errors && errors[0]"
                            >
                              <u-input
                                v-model="row.advancedPart.apiURL"
                                :color="errors && errors[0] ? 'error' : ''"
                                size="huge"
                              />
                            </kube-form-item>
                          </validation-provider>
                          <kube-form-item
                            label="corpID"
                            layout="list"
                            :message="errors && errors[0]"
                          >
                            <u-input
                              v-model="row.advancedPart.corpID"
                              size="huge"
                            />
                          </kube-form-item>
                          <kube-form-item
                            label="agentID"
                            layout="list"
                          >
                            <u-input
                              v-model="row.advancedPart.agentID"
                              size="huge"
                            />
                          </kube-form-item>
                          <kube-form-item
                            label="apiSecret"
                            layout="list"
                          >
                            <secret-select v-model="row.advancedPart.apiSecret" />
                          </kube-form-item>
                        </template>
                      </kube-form>
                      <kube-form v-if="inputsModel.receiver === 'webhookConfigs'">
                        <kube-form-item
                          label="Whether to accept alert recovery notification"
                          label-size="large"
                        >
                          <u-checkbox
                            v-model="row.sendResolved"
                          />
                        </kube-form-item>
                        <validation-provider
                          v-slot="{ errors }"
                          :name="`webhookConfigs-${index}-url`"
                          rules="urlpattern"
                        >
                          <kube-form-item
                            label="url"
                            layout="list"
                            :message="errors && errors[0]"
                          >
                            <u-input
                              v-model="row.url"
                              :color="errors && errors[0] ? 'error' : ''"
                              size="huge"
                            />
                          </kube-form-item>
                        </validation-provider>
                        <kube-form-item
                          label="maxAlerts"
                          layout="list"
                        >
                          <u-number-input
                            v-model="row.maxAlerts"
                            :min="0"
                          />
                        </kube-form-item>
                      </kube-form>
                      <template v-if="inputsModel.receiver === 'emailConfigs'">
                        <kube-form-item
                          label="Whether to accept alert recovery notification"
                          label-size="large"
                        >
                          <u-checkbox
                            v-model="row.sendResolved"
                          />
                        </kube-form-item>
                        <validation-provider
                          v-slot="{ errors }"
                          :name="`emailConfigs-${index}-to`"
                        >
                          <kube-form-item
                            label="Recipient email"
                            layout="list"
                            :message="errors && errors[0]"
                          >
                            <u-input
                              v-model="row.to"
                              type="email"
                              :color="errors && errors[0] ? 'error' : ''"
                              size="huge"
                            />
                          </kube-form-item>
                        </validation-provider>
                        <u-link @click="row.advanced = !row.advanced">
                          {{ row.advanced ? 'Close' : 'Expand' }}More configurations
                        </u-link>
                        <template v-if="row.advanced">
                          <validation-provider
                            v-slot="{ errors }"
                            :name="`emailConfigs-${index}-from`"
                          >
                            <kube-form-item
                              label="from"
                              layout="list"
                              :message="errors && errors[0]"
                            >
                              <u-input
                                v-model="row.advancedPart.from"
                                type="email"
                                :color="errors && errors[0] ? 'error' : ''"
                                size="huge"
                              />
                            </kube-form-item>
                          </validation-provider>
                          <kube-form-item
                            label="smarthost"
                            layout="list"
                          >
                            <u-input
                              v-model="row.advancedPart.smarthost"
                              size="huge"
                            />
                          </kube-form-item>
                          <kube-form-item
                            label="authUsername"
                            layout="list"
                          >
                            <u-input
                              v-model="row.advancedPart.authUsername"
                              size="huge"
                            />
                          </kube-form-item>
                          <kube-form-item
                            label="authPassword"
                            layout="list"
                          >
                            <u-input
                              v-model="row.advancedPart.authPassword"
                              size="huge"
                              type="password"
                            />
                          </kube-form-item>
                          <kube-form-item
                            label="authSecret"
                            layout="list"
                          >
                            <secret-select v-model="row.advancedPart.authSecret" />
                          </kube-form-item>
                        </template>
                      </template>
                    </template>
                  </kube-dynamic-block>
                  <!-- <template v-if="model.spec.receivers[channel].enable">

                  </template> -->
                </div>
              </template>
            </kube-tab>
          </kube-form-item>
        </validation-provider>

        <u-submit-button
          :click="submit.bind(this)"
          place="right"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                OK
              </u-button>
              <u-button @click="close">
                Cancel
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form>
    </validation-observer>
  </u-modal>
</template>

<script>
import { cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubeworkz/services/k8s-resource';
import blockLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/row.vue';
import {
    toPlainObject as toAMCSPlainObject,
    toK8SObject as toAMCSK8SObject,
    patchK8SObject as patchAMCSK8SObject,
    CONFIGS as configTemplate,
    // LabelMapping,
} from 'kubeworkz/k8s-resources/alertmanagerconfigspec';
import secretSelect from './secret-select.vue';
import {
    specCRD,
} from '../utils';
export default {
    components: {
        secretSelect,
    },
    mixins: [ Modal ],
    data() {
        return {
            model: toAMCSPlainObject(),
            isEdit: false,
            initStorage: 0,
            blockLayout,
            blockRowLayout,
        };
    },
    computed: {
        namespace: get('scope/project@spec.namespace'),
        cluster: get('scope/cluster@value'),
        tenant: get('scope/tenant@value'),
        project: get('scope/project@value'),
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    ...specCRD,
                },
            };
        },
        enableState() {
            return this.model.spec.receivers.map(c => c.enable);
        },
    },
    methods: {
        async open(item) {
            if (item) {
                this.isEdit = true;
                const response = await workloadService.getNamespaceCRResourceInstance({
                    pathParams: {
                        ...this.params.pathParams,
                        name: item.metadata.name,
                    },
                });
                this.model = toAMCSPlainObject(response);
            } else {
                this.model = toAMCSPlainObject();
            }
            this.show = true;
        },
        getDataTemplate(receiver) {
            return cloneDeep(configTemplate[receiver]);
        },
        async submit() {
            if (this.isEdit) {
                const yaml = patchAMCSK8SObject(this.model, this.tenant, this.project);
                await workloadService.patchNamespaceCRResourceInstance({
                    pathParams: {
                        ...this.params.pathParams,
                        name: this.model.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toAMCSK8SObject(this.model, this.tenant, this.project);
                await workloadService.createNamespaceCRResource({
                    pathParams: this.params.pathParams,
                    data: yaml,
                });
            }
            this.$emit('refresh');
            this.close();
        },
    },
};
</script>

<style module>
.group + .group{
    margin-top: 20px;
}
.group {
    min-height: 400px;
}
.header{
    width: 580px;
    padding: 10px;
    background-clip: padding-box;
}
/* .wrapper {
    max-height: 300px;
    overflow-y: scroll;
} */
</style>
