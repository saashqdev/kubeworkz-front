<template>
  <u-modal
    title="Add item"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <validation-observer
      ref="observer"
      v-slot="{ invalid }"
    >
      <kube-form ref="form">
        <kube-form-item
          v-if="!isEdit && type !== 'createInTenant'"
          label="Owned tenant"
          required
        >
          <x-request
            ref="request"
            :service="service"
            :params="{
              params: {
                user,
              }
            }"
            :processor="resolver"
          >
            <template slot-scope="{ data }">
              <u-select
                v-model="model.tenant"
                size="large"
                :data="data"
              />
            </template>
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
              v-model="model.spec.displayName"
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
            v-if="!isEdit"
            label="Project ID"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.metadata.name"
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
            v-if="!isEdit"
            label="Project description"
            required
            :message="errors && errors[0]"
          >
            <u-input
              v-model="model.spec.description"
              size="normal huge"
              :color="errors && errors[0] ? 'error' : ''"
              maxlength="32"
              maxlength-message="Must not exceed 32 characters"
            />
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
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import { clone, get as getFunc } from 'lodash';
import userService from 'kubeworkz/services/user';
import scopeService from 'kubeworkz/services/scope';
import {
    toPlainObject,
    toK8SObject,
    toPatchObject,
} from 'kubeworkz/k8s-resources/scope/project';

export default {
    mixins: [ Modal ],
    data() {
        return {
            type: 'create',
            model: toPlainObject(),
            service: userService.getUserTenants,
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
        isEdit() {
            return this.type === 'edit';
        },
    },
    methods: {
        openInTenant(tenant) {
            this.type = 'createInTenant';
            this.model = toPlainObject();
            this.model.tenant = tenant;
            this.show = true;
        },
        open(target) {
            if (target) {
                this.model = clone(target);
                this.type = 'edit';
            } else {
                this.model = toPlainObject();
                this.type = 'create';
            }
            this.show = true;
        },
        async submit() {
            if (!this.isEdit) {
                await scopeService.createScope({
                    pathParams: {
                        scope: 'projects',
                    },
                    data: toK8SObject(this.model),
                });
            } else {
                await scopeService.patchScope({
                    pathParams: {
                        scope: 'projects',
                        name: this.model.metadata.name,
                    },
                    data: toPatchObject(this.model),
                });
            }
            this.$emit('refresh', this.model.tenant);
            this.show = false;

        },
        resolver(data) {
            const items = data.items.map(i => ({
                text: getFunc(i, 'spec.displayName'),
                value: getFunc(i, 'metadata.name'),
            }));
            if (!this.model.tenant) {
                this.model.tenant = items[0].value;
            }
            return items;
        },
    },
};
</script>

<style>

</style>
