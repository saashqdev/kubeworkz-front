<template>
  <kube-valve
    name="role"
    style="display: inline-block;"
    :request="getRoles"
    :valve="modelValue"
  >
    <u-select
      v-if="list.length > 0"
      v-model="modelValue"
      v-bind="$attrs"
      :data="list"
    />
    <u-select
      v-else
      v-bind="$attrs"
      value="No role yet"
      disabled
    />
  </kube-valve>
</template>

<script>
import { get } from 'lodash';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import userService from 'kubeworkz/services/user';
import {
    setValueIfListNotPresent,
} from 'kubeworkz/utils/functional';
// import {
//     toPlainObject as toTenantPlainObject,
// } from 'kubeworkz/k8s-resources/scope/tenant';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        project: Object,
        tenant: Object,
    },
    data() {
        return {
            list: [],
        };
    },
    computed: {
        modelValue: {
            get() {
                return get(this.model, 'value', null);
            },
            set(val) {
                this.model = this.list.find(m => m.value === val);
            },
        },
        params() {
            const pns = get(this.project, 'spec.namespace');
            const tns = get(this.tenant, 'spec.namespace');
            return {
                params: {
                    namespace: pns || tns,
                },
            };
        },
    },
    methods: {
        async getRoles() {

            await this.$nextTick(); // Avoid model modelValue changes later, resulting in errors in subsequent data values.
            const response = await userService.getUserRole(this.params);
            console.log(response);
            const { clusterRoles, roles } = response;
            const clusterR = clusterRoles.items.map(i => ({
                text: i,
                value: i,
                binding: 'clusterrolebindings',
            }));
            const r = roles.items.map(i => ({
                text: i,
                value: i,
                binding: 'rolebindings',
            }));
            this.list = [ ...clusterR, ...r ];
            setValueIfListNotPresent({
                list: this.list,
                path: 'value',
                current: get(this.model, 'value'),
            }, val => {
                this.modelValue = val.value;
            });
        },
    },

};
</script>

<style>

</style>
