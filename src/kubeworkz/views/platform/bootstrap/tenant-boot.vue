<template>
  <div>
    <el-form ref="form" :model="model" label-position="right" label-width="120px">
      <el-form-item
        label="Tenant name"
        prop="model.spec.displayName"
        :rules="[
          validators.required(),
        ]"
      >
        <el-input
          v-model="model.model.spec.displayName"
        />
      </el-form-item>
      <el-form-item
        label="Tenant ID"
        prop="model.metadata.name"
        :rules="[
          validators.required(),
          validators.k8sResourceNameValidator(),
        ]"
      >
        <el-input
          v-model="model.model.metadata.name"
          placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"
        />
      </el-form-item>
      <el-form-item
        label="Tenant Administrator"
        prop="tenantadmin"
        :rules="[
          validators.required(),
        ]"
      >
        <x-request
          ref="request"
          :service="userService"
          :params="{}"
          :processor="userResolver"
        >
          <template slot-scope="{ data }">
            <el-select
              v-model="model.tenantadmin"
            >
              <el-option
                v-for="optionItem in (data || [])"
                :key="optionItem.value"
                :label="optionItem.text"
                :value="optionItem.value"
              />
            </el-select>
          </template>
        </x-request>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit" :loading="submitLoading">Create</el-button>
      </el-form-item>
    </el-form>
    <!-- <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <kube-form
        ref="form"
        style="margin-top: 20px"
      >
        <validation-provider
          v-slot="{ errors }"
          name="Name"
          rules="required"
        >
          <kube-form-item
            label="Tenant name"
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
          name="DisplayName"
          rules="required"
        >
          <kube-form-item
            label="Tenant ID"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.model.metadata.name"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
              maxlength="32"
              maxlength-message="Must not exceed 32 characters"
              placeholder="Globally unique identifier, consisting of 2-32 lowercase letters, numbers, and underscores"
            />
          </kube-form-item>
        </validation-provider>

        <kube-form-item
          label="Tenant Administrator"
          required
        >
          <x-request
            ref="request"
            :service="userService"
            :params="{}"
            :processor="userResolver"
          >
            <template slot-scope="{ data }">
              <u-select
                v-model="model.tenantadmin"
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
    </validation-observer> -->
  </div>
</template>

<script>
import { get, cloneDeep } from 'lodash';
import scopeService from 'kubeworkz/services/scope';
import userService from 'kubeworkz/services/user';
import {
    toK8SObject,
    toPlainObject,
} from 'kubeworkz/k8s-resources/scope/tenant';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';

import {
    toK8SObject as toRoleBindingK8SObject,
} from 'kubeworkz/k8s-resources/rolebinding/rolebinding';

import { retryAsync } from 'kubeworkz/utils/functional';
import * as validators from 'kubeworkz/utils/validators';

export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            userService: userService.getUserList,
            validators,
            submitLoading: false,
        };
    },
    methods: {
        userResolver(result) {
            const items = get(result, 'items', []).map(i => ({
                text: i.spec.displayName,
                value: i.name,
            }));
            const finded = items.find(i => i.value === this.model.tenantadmin);
            if (!finded) {
                this.model.tenantadmin = get(items, '[0].value');
            }

            return items;
        },
        async submit() {
            // Trigger verification
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.submitLoading = true;
            try {
                const response = await scopeService.createScope({
                    pathParams: {
                        scope: 'tenants',
                    },
                    data: toK8SObject(this.model.model),
                });

                const tenantCurr = toPlainObject(response.data);
                tenantCurr.spec.namespace = `kubeworkz-tenant-${tenantCurr.metadata.name}`;

                const data = toRoleBindingK8SObject(
                    this.model.tenantadmin,
                    tenantCurr,
                    {},
                    'tenant-admin');
                await retryAsync(() => userService.createRoleBindings({
                  data,
              }), 3000, 3);

                this.$toast.success('Created successfully');
                this.$emit('next', tabs => {
                    const namespacemodel = tabs.find(t => t.tab === 'namespace');
                    if (namespacemodel) {
                        namespacemodel.model.pipe.tenant = {
                            ...cloneDeep(tenantCurr),
                            value: tenantCurr.metadata.name,
                            text: tenantCurr.spec.displayName,
                        };
                    }

                    const membermodel = tabs.find(t => t.tab === 'member');
                    if (membermodel) {
                        membermodel.model.tenant = {
                            ...cloneDeep(tenantCurr),
                            value: tenantCurr.metadata.name,
                            text: tenantCurr.spec.displayName,
                        };
                    }

                    const projectmodel = tabs.find(t => t.tab === 'project');
                    if (projectmodel) {
                        projectmodel.model.model.tenant = tenantCurr.metadata.name;
                    }

                    const tenantquotamodel = tabs.find(t => t.tab === 'tenantquota');
                    if (tenantquotamodel) {
                        tenantquotamodel.model.tenant = tenantCurr.metadata.name;
                    }
                });
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style>

</style>
