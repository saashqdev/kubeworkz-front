<template>
  <u-modal
    title="Add member"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="large"
    @close="close"
  >
    <kube-pipe
      graph="tenant > project > role"
      direction="horizontal"
    >
      <kube-form ref="form">
        <kube-form-item
          label="Owned tenant"
          required
        >
          <kube-tenant-select
            v-model="tenant"
            :disabled="isEdit || scope === 'tenant' || scope === 'project'"
            size="normal"
          />
        </kube-form-item>
        <kube-form-item
          label="Project"
        >
          <kube-project-select
            v-model="project"
            :disabled="isEdit || scope === 'project'"
            :tenant="tenant && tenant.value"
          />
        </kube-form-item>
        <kube-form-item
          label="Username"
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
                v-model="user"
                :disabled="isEdit"
                size="large"
                :data="data"
              />
            </template>
          </x-request>
        </kube-form-item>
        <kube-form-item
          label="Role"
          required
        >
          <kube-role-select
            v-model="role"
            :tenant="tenant"
            :project="project"
          />
        </kube-form-item>


        <u-submit-button
          :click="submit.bind(this)"
          place="right"
        >
          <template slot-scope="scope">
            <u-linear-layout>
              <u-button
                color="primary"
                :disabled="scope.submitting"
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
    </kube-pipe>
  </u-modal>
</template>

<script>
// Account identity
import { Modal } from '@micro-app/common/mixins';
import { get } from 'lodash';
import userService from 'kubeworkz/services/user';
import {
    toK8SObject as toRoleBindingK8SObject,
} from 'kubeworkz/k8s-resources/rolebinding/rolebinding';
import kubeTenantSelect from 'kubeworkz/component/global/common/kube-tenant-select.vue';
import kubeProjectSelect from 'kubeworkz/component/global/common/kube-project-select.vue';
import kubeRoleSelect from 'kubeworkz/component/global/common/kube-role-select.vue';

export default {
    components: {
        kubeTenantSelect,
        kubeProjectSelect,
        kubeRoleSelect,
    },
    mixins: [ Modal ],
    data() {
        return {
            userService: userService.getUserList,
            type: 'create',
            tenant: null,
            project: null,
            role: null,
            user: null,
            scope: undefined,
        };
    },
    computed: {
        isEdit() {
            return this.type === 'edit';
        },
    },
    methods: {
        // openInTenant(tenant) {
        //     this.type = 'createInTenant';
        //     this.model = toPlainObject();
        //     this.tenant = tenant;
        //     this.show = true;
        // },
        open(selected, scope) {
            this.scope = scope;
            // if (target) {
            //     this.model = clone(target);
            //     this.type = 'edit';
            // } else {
            // this.$set(this, 'model', toPlainObject());

            Object.assign(this, selected);
            if (selected.user) {
                this.type = 'edit';
            } else {
                this.type = 'create';
            }

            // this.$nextTick(() => {
            //     this.$refs.pipe.pipeRequest();
            // });

            // }
            this.show = true;
        },
        userResolver(result) {
            const items = get(result, 'items', []).map(i => ({
                text: i.spec.displayName,
                value: i.name,
            }));
            const finded = items.find(i => i.value === this.user);
            if (!finded) {
                this.user = get(items, '[0].value');
            }

            return items;
        },

        async submit() {
            const data = toRoleBindingK8SObject(
                this.user,
                this.tenant,
                this.project,
                this.role.value);
            await userService.createRoleBindings({
                data,
            });
            this.show = false;
            this.$emit('refresh');

        },
        resolver(data) {
            const items = data.items.map(i => ({
                text: get(i, 'spec.displayName'),
                value: get(i, 'metadata.name'),
            }));
            if (!this.tenant) {
                this.tenant = items[0].value;
            }
            return items;
        },
    },
};
</script>

<style>

</style>
