<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form>
      <kube-form-item label="Cluster">
        {{ cluster }}
      </kube-form-item>
      <kube-name-input
        v-model="model.metadata.name"
        :disabled="isEdit"
        :rules="{
          ConsistoLetterNumbersUnderscores: false,
        }"
        label="Alert name"
      />
      <kube-form-item
        label="Alert group"
        layout="block"
      >
        <kube-tab
          v-model="model.spec.groups"
          :data-template="getDefaultGroup"
        >
          <template slot-scope="{ model: gModel, errorPrefix }">
            <kube-form
              style="margin-top: 20px"
              label-size="small"
            >
              <kube-name-input
                v-model="gModel.name"
                layout="list"
                :name="`${errorPrefix}-name`"
                :rules="{
                  ConsistoLetterNumbersUnderscores: false,
                }"
              />
              <kube-form-item
                label="Alert group configuration"
                layout="list"
              >
                <kube-dynamic-block
                  v-model="gModel.rules"
                  title-key="expr"
                  :layout-comp="blockLayout"
                  :row-comp="blockRowLayout"
                  :column-comp="null"
                  :data-template="getDefaultRule"
                  button-name="Add to"
                  style="width: 580px"
                >
                  <template slot-scope="{ model: ruleModel, index: ruleErrorPrefix }">
                    <kube-form label-size="large">
                      <validation-provider
                        v-slot="{ errors }"
                        :name="`${errorPrefix}-rule-${ruleErrorPrefix}-expr`"
                        rules="required"
                      >
                        <kube-form-item
                          label="Expression"
                          layout="list"
                          required
                          :message="errors && errors[0]"
                        >
                          <u-textarea
                            v-model="ruleModel.expr"
                            size="normal huge"
                            :color="errors && errors[0] ? 'error' : ''"
                          />
                        </kube-form-item>
                      </validation-provider>
                      <kube-form-item
                        v-if="ruleModel.hideAdvanced ? ruleModel.for : true"
                        layout="list"
                        label="for"
                      >
                        <u-input
                          v-model="ruleModel.for"
                          size="normal huge"
                        />
                      </kube-form-item>
                      <kube-form-item
                        v-if="ruleModel.hideAdvanced ? ruleModel.severity : true"
                        layout="list"
                        label="Alert level"
                      >
                        <u-radios v-model="ruleModel.severity">
                          <u-radio label="info">
                            Info
                          </u-radio>
                          <u-radio label="warning">
                            Warning
                          </u-radio>
                          <u-radio label="critical">
                            Urgent
                          </u-radio>
                        </u-radios>
                      </kube-form-item>
                      <kube-form-item
                        v-if="ruleModel.hideAdvanced ? (ruleModel.summary || ruleModel.description || ruleModel.runbook_url || ruleModel.annotations.filter(l => l.key).length) : true"
                        layout="list"
                        label="Annotations"
                      />
                      <kube-form-item
                        v-if="ruleModel.hideAdvanced ? ruleModel.summary : true"
                        layout="list"
                        label="Summary"
                      >
                        <u-textarea
                          v-model="ruleModel.summary"
                          size="normal huge"
                        />
                      </kube-form-item>
                      <kube-form-item
                        v-if="ruleModel.hideAdvanced ? ruleModel.description : true"
                        layout="list"
                        label="Description information"
                      >
                        <u-textarea
                          v-model="ruleModel.description"
                          size="normal huge"
                        />
                      </kube-form-item>
                      <kube-form-item
                        v-if="ruleModel.hideAdvanced ? ruleModel.runbook_url : true"
                        layout="list"
                        label="Runbook Url"
                      >
                        <u-textarea
                          v-model="ruleModel.runbook_url"
                          size="normal huge"
                        />
                      </kube-form-item>
                      <kube-form-item
                        v-if="ruleModel.hideAdvanced ? ruleModel.annotations.filter(l => l.key).length : true"
                        layout="list"
                        label=""
                      >
                        <kube-plain-label-editor
                          v-model="ruleModel.annotations"
                          style="width: 548px"
                        />
                      </kube-form-item>
                      <kube-form-item
                        v-if="ruleModel.hideAdvanced ? ruleModel.labels.filter(l => l.key).length : true"
                        layout="list"
                        label="labels"
                      >
                        <kube-plain-label-editor
                          v-model="ruleModel.labels"
                          style="width: 548px"
                        />
                      </kube-form-item>
                      <kube-form-item
                        layout="list"
                        label=""
                      >
                        <u-link @click="ruleModel.hideAdvanced = !ruleModel.hideAdvanced">
                          {{ ruleModel.hideAdvanced ? 'Expand more configurations' : 'Close unfilled configuration' }}
                        </u-link>
                      </kube-form-item>
                    </kube-form>
                  </template>
                </kube-dynamic-block>
              </kube-form-item>
            </kube-form>
          </template>
        </kube-tab>
      </kube-form-item>

      <kube-form-item>
        <u-submit-button
          :click="submit.bind(this)"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="invalid || scope.submitting"
                :icon="scope.submitting ? 'loading' : ''"
                @click="scope.submit"
              >
                {{ isEdit ? 'Modify' : 'Create' }}
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>
<script>
import { cloneDeep } from 'lodash';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toPrometheusRulePlainObject,
    toK8SObject as toPrometheusRuleK8SObject,
    patchK8SObject as toPatchPrometheusRuleObject,
    getDefaultGroup,
    getDefaultRule,
    RESOURCE,
} from 'kubeworkz/k8s-resources/prometheusRule/global';
import blockLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/index.vue';
import blockRowLayout from 'kubeworkz/component/common/kube-dynamic-block-layout/row.vue';

export default {
    metaInfo() {
        return {
            title: `${this.isEdit ? 'Set up' : 'Create'} alert rules - kubeworkz`,
        };
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            isEdit: !!this.instance,
            model: this.instance ? cloneDeep(this.instance) : toPrometheusRulePlainObject(),
            blockLayout,
            blockRowLayout,
        };
    },
    computed: {
        cluster() {
            return this.$route.params.cluster;
        },
    },
    methods: {
        getDefaultGroup,
        getDefaultRule,
        async submit() {
            if (this.isEdit) {
                const yaml = toPatchPrometheusRuleObject(this.model);
                await workloadService.patchNamespaceCRResourceInstance({
                    pathParams: {
                        cluster: this.cluster,
                        ...RESOURCE,
                        name: this.model.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toPrometheusRuleK8SObject(this.model);
                await workloadService.createNamespaceCRResource({
                    pathParams: {
                        cluster: this.cluster,
                        ...RESOURCE,
                    },
                    data: yaml,
                });
            }

            this.$router.push({ path: '/platform/PrometheusRule/list', query: { cluster: this.cluster } });
        },
    },
};
</script>
