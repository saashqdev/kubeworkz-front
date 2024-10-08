<template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <kube-form style="margin-top: 20px">
      <kube-form-item
        label="Tenant"
        required
      >
        <x-request
          ref="requestTenant"
          :service="tenantService"
          :params="{
            params: {
              user,
            }
          }"
          :processor="tenantResolver"
        >
          <u-select
            v-model="model.model.tenant"
            size="normal huge"
            :data="tenants"
          />
        </x-request>
      </kube-form-item>

      <validation-provider
        v-slot="{ errors }"
        name="DisplayName"
        rules="required"
      >
        <kube-form-item
          label="Project name"
          required
          :message="errors && errors[0]"
          maxlength="63"
          maxlength-message="Must not exceed 63 characters"
        >
          <u-input
            v-model="model.model.spec.displayName"
            size="normal huge"
            :color="errors && errors[0] ? 'error' : ''"
          />
        </kube-form-item>
      </validation-provider>

      <validation-provider
        v-slot="{ errors }"
        name="Name"
        rules="required"
      >
        <kube-form-item
          label="Project ID"
          required
          :message="errors && errors[0]"
        >
          <u-input
            v-model="model.model.metadata.name"
            size="normal huge"
            :color="errors && errors[0] ? 'error' : ''"
            maxlength="32"
            maxlength-message="Must not exceed 32 characters"
            placeholder="A globally unique identifier consisting of 2-32 lowercase letters, numbers, and a dash-"
          />
        </kube-form-item>
      </validation-provider>
      <validation-provider
        v-slot="{ errors }"
        name="Description"
        rules="required"
      >
        <kube-form-item
          label="Project description"
          required
          :message="errors && errors[0]"
        >
          <u-input
            v-model="model.model.spec.description"
            size="normal huge"
            maxlength="32"
            maxlength-message="Must not exceed 32 characters"
          />
        </kube-form-item>
      </validation-provider>
      <kube-form-item
        label="Project manager"
        required
      >
        <x-request
          ref="userrequest"
          :service="userService"
          :params="{}"
          :processor="userResolver"
        >
          <template slot-scope="{ data }">
            <u-select
              v-model="model.projectadmin"
              size="normal huge"
              :data="data"
            />
          </template>
        </x-request>
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
                Create
              </u-button>
            </u-linear-layout>
          </template>
        </u-submit-button>
      </kube-form-item>
    </kube-form>
  </validation-observer>
</template>

<script>
import { get as getFunc, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import userService from 'kubeworkz/services/user';
import scopeService from 'kubeworkz/services/scope';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import {
    toPlainObject as toProjectPlainObject,
    toK8SObject as toProjectK8SObject,
} from 'kubeworkz/k8s-resources/scope/project';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        state: Boolean,
    },
    data() {
        return {
            tenantService: userService.getUserTenants,
            userService: userService.getUserList,
            tenants: [],
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
    },
    watch: {
        state(val) {
            if (val) {
                this.$refs.requestTenant.request();
            }
        },
    },
    methods: {
        tenantResolver(data) {
            const items = data.items.map(i => ({
                text: getFunc(i, 'spec.displayName'),
                value: getFunc(i, 'metadata.name'),
                tenant: i,
            }));
            this.tenants = items;
            if (!this.model.model.tenant) {
                this.model.model.tenant = items[0].value;
            }
            return items;
        },
        userResolver(result) {
            const items = (getFunc(result, 'items') || []).map(i => ({
                text: i.spec.displayName,
                value: i.name,
            }));
            const finded = items.find(i => i.value === this.model.projectadmin);
            if (!finded) {
                this.model.projectadmin = getFunc(items, '[0].value');
            }

            return items;
        },
        async submit() {
            const response = await scopeService.createScope({
                pathParams: {
                    scope: 'projects',
                },
                data: toProjectK8SObject(this.model.model),
            });
            const projectCurr = toProjectPlainObject(response.data);
            const tenantCurr = this.tenants.find(t => t.value === this.model.model.tenant).tenant;
            this.$toast.success('Created successfully');
            this.$emit('next', tabs => {
                const namespacemodel = tabs.find(t => t.tab === 'namespace');
                if (namespacemodel) {
                    namespacemodel.model.pipe.tenant = {
                        ...cloneDeep(tenantCurr),
                        value: tenantCurr.metadata.name,
                        text: tenantCurr.spec.displayName,
                    };

                    namespacemodel.model.pipe.project = {
                        ...cloneDeep(projectCurr),
                        value: projectCurr.metadata.name,
                        text: projectCurr.spec.displayName,
                    };
                }

                const membermodel = tabs.find(t => t.tab === 'member');

                if (membermodel) {
                    membermodel.model.tenant = {
                        ...cloneDeep(tenantCurr),
                        value: tenantCurr.metadata.name,
                        text: tenantCurr.spec.displayName,
                    };
                    membermodel.model.project = {
                        ...cloneDeep(projectCurr),
                        value: projectCurr.metadata.name,
                        text: projectCurr.spec.displayName,
                    };
                }
            });
        },
    },

};
</script>

<style>

</style>
