<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form>
      <kube-name-input
        v-model="model.metadata.name"
        :disabled="isEdit"
        label="Alert name"
      />
      <kube-form-item
        label="Input mode"
        required
      >
        <u-radios
          v-model="entryModel"
          :disabled="isEdit"
          @select="handleEntryModelSelect"
        >
          <u-radio label="common">
            General
          </u-radio>
          <u-radio label="advanced">
            Advanced
          </u-radio>
        </u-radios>
      </kube-form-item>
      <alertExtendSetting
        v-if="entryModel === 'common'"
        ref="alertExtendSetting"
        :is-edit="isEdit"
        :extend-info="extendInfo"
      />
      <validation-provider
        v-else-if="entryModel === 'advanced'"
        v-slot="{ errors }"
        name="expr"
        rules="required"
      >
        <kube-form-item
          label="Expression"
          required
          :message="errors && errors[0]"
        >
          <u-input
            v-model="model.spec.rule.expr"
            size="normal huge"
            :color="errors && errors[0] ? 'error' : ''"
          />
        </kube-form-item>
      </validation-provider>
      <kube-form-item
        label="Alert level"
      >
        <u-radios v-model="model.spec.rule.severity">
          <u-radio label="info">
            Info
          </u-radio>
          <u-radio label="warning">
            Warning
          </u-radio>
          <u-radio label="critical">
            Critical
          </u-radio>
        </u-radios>
      </kube-form-item>
      <validation-provider
        v-slot="{ errors }"
        name="ams"
        rules="required"
      >
        <kube-form-item
          label="Notification policy group"
          :message="errors && errors[0]"
          required
        >
          <x-request
            :service="service"
            :params="AMSparams"
            :processor="AMSresolver"
          >
            <template slot-scope="{ data, loading }">
              <u-loading v-if="loading" />
              <template v-else>
                <u-select
                  v-if="data && data.length > 0"
                  v-model="model.spec.rule.ams"
                  :color="errors && errors[0] ? 'error' : ''"
                  :data="data"
                />
                <u-select
                  v-else
                  disabled
                  :color="errors && errors[0] ? 'error' : ''"
                  :data="[{text: 'No alert strategy yet'}]"
                />
              </template>
            </template>
          </x-request>
        </kube-form-item>
      </validation-provider>
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
                {{ isEdit ? 'Modify now' : 'Create now' }}
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import { cloneDeep, set, get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toPrometheusRulePlainObject,
    toK8SObject as toPrometheusRuleK8SObject,
    patchK8SObject as toPatchPrometheusRuleObject,
} from 'kubeworkz/k8s-resources/prometheusRule';
import alertExtendSetting from './alert-extend-setting';
import {
    setValueIfListNotPresent,
} from 'kubeworkz/utils/functional';
import {
    specCRD,
    rulespecCRD,
} from '../utils';

export default {
    components: {
        alertExtendSetting,
    },
    props: {
        instance: Object,
    },
    data() {
        let entryModel = 'common';
        let extendInfo = null;
        if (this.$route.meta.type === 'edit') {
            const annotations = this.instance.puresource.spec.groups[0].rules[0].annotations;
            const temp = annotations && annotations.extendInfo;
            if (temp) {
                extendInfo = JSON.parse(temp);
            } else {
                entryModel = 'advanced';
            }
        }
        return {
            model: cloneDeep(this.instance) || toPrometheusRulePlainObject(),
            entryModel,
            extendInfo,
            service: workloadService.getNamespaceCRResource,
        };
    },
    computed: {
        namespace: get('scope/project@spec.namespace'),
        cluster: get('scope/cluster@value'),
        tenant: get('scope/tenant@value'),
        project: get('scope/project@value'),
        AMSparams() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    ...specCRD,
                },
                params: {
                    pageSize: 10000,
                },
            };
        },
        isEdit() {
            return this.$route.meta.type === 'edit';
        },
    },
    methods: {
        handleEntryModelSelect() {
            this.model.spec.rule.expr = '';
        },
        AMSresolver(response) {
            const items = (response.items || []).map(ams => ({
                text: ams.metadata.name,
                value: ams.metadata.labels['kubeworkz.io/owner'],
            }));
            setValueIfListNotPresent({
                list: items,
                path: 'value',
                current: getFunc(this.model, 'spec.rule.ams'),
            }, val => {
                set(this.model, 'spec.rule.ams', getFunc(val, 'value'));
            });
            return items;
        },
        async submit() {
            if (this.isEdit) {
                const yaml = toPatchPrometheusRuleObject(this.model);
                if (this.entryModel === 'common') {
                    const expr = this.$refs.alertExtendSetting.$getExpr();
                    const extendInfo = this.$refs.alertExtendSetting.$getData();
                    yaml.spec.groups[0].rules[0].expr = expr;
                    yaml.spec.groups[0].rules[0].annotations = yaml.spec.groups[0].rules[0].annotations || {};
                    yaml.spec.groups[0].rules[0].annotations.extendInfo = JSON.stringify(extendInfo);
                }
                await workloadService.patchNamespaceCRResourceInstance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        ...rulespecCRD,
                        name: this.instance.metadata.name,
                    },
                    data: yaml,
                });
            } else {
                const yaml = toPrometheusRuleK8SObject(this.model, this.project);
                if (this.entryModel === 'common') {
                    const expr = this.$refs.alertExtendSetting.$getExpr();
                    const extendInfo = this.$refs.alertExtendSetting.$getData();
                    yaml.spec.groups[0].rules[0].expr = expr;
                    yaml.spec.groups[0].rules[0].annotations = yaml.spec.groups[0].rules[0].annotations || {};
                    yaml.spec.groups[0].rules[0].annotations.extendInfo = JSON.stringify(extendInfo);
                }
                await workloadService.createNamespaceCRResource({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        ...rulespecCRD,
                    },
                    data: yaml,
                });
            }
            this.$router.push({ path: '/control/PrometheusRule/list' });
        },
    },
};
</script>

<style>

</style>
