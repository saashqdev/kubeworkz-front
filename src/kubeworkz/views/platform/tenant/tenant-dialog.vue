<template>
  <u-modal
    :title="type === 'edit' ? 'Modify name': 'Add tenant'"
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
              v-model="model.spec.displayName"
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
            v-if="!isEdit"
            label="Tenant ID"
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
import { Modal } from '@micro-app/common/mixins';
import { clone } from 'lodash';
import scopeService from 'kubeworkz/services/scope';
import {
    toPlainObject,
    toK8SObject,
    toPatchObject,
} from 'kubeworkz/k8s-resources/scope/tenant';

export default {
    mixins: [ Modal ],
    data() {
        return {
            type: 'create',
            model: toPlainObject(),
        };
    },
    computed: {
        isEdit() {
            return this.type === 'edit';
        },
    },
    methods: {
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
                        scope: 'tenants',
                    },
                    data: toK8SObject(this.model),
                });
            } else {
                await scopeService.patchScope({
                    pathParams: {
                        scope: 'tenants',
                        name: this.model.metadata.name,
                    },
                    data: toPatchObject(this.model),
                });
            }
            this.show = false;
            this.$emit('refresh');
        },
    },
};
</script>

<style>

</style>
