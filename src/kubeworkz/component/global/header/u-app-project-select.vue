<template>
  <u-popper-select
    label="Project"
    :list="items"
    :value.sync="model"
    :disabled="items.length === 0"
    @before-select="onBeforeSelect($event, 'tenant')"
    @select="onChange"
  />
</template>

<script>
import { get as getFunc } from 'lodash';
import { get, sync } from 'vuex-pathify';
import valveMixin from 'kubeworkz/mixins/pipe/valve.mixin';
import userService from 'kubeworkz/services/user';
import {
    toPlainObject,
} from 'kubeworkz/k8s-resources/scope/tenant';
import {
    setValueIfListNotPresent,
} from 'kubeworkz/utils/functional';
export default {
    extends: valveMixin,
    data: () => ({
        items: [],
        name: 'project',
    }),
    computed: {
        user: get('scope/user.AccountId'),
        project: sync('scope/project'),
        tenant: get('scope/tenant'),
    },
    methods: {
        onBeforeSelect(val) {
            if (!this.isInNSBoard) {
                this.$router.push({ path: '/namespace' });
            }
            this.project = this.items.find(i => i.value === val.value);
            this.model = val.value;
        },
        onChange() {

        },
        async request() {
            if (!this.tenant) return;

            const response = await userService.getUserProjects({
                params: {
                    user: this.user,
                    tenant: this.tenant.value,
                    // labelSelector: `kubeworkz.io/tenant=${this.tenant.value}`,
                },
            });
            this.items = (response.items || []).map(i => {
                const m = toPlainObject(i);
                return {
                    text: m.spec.displayName,
                    value: m.metadata.name,
                    ...m,
                };
            });

            setValueIfListNotPresent({
                list: this.items,
                path: 'metadata.name',
                current: this.model || this.$route.query.project,
            }, val => {
                console.log(val);
                this.model = getFunc(val, 'metadata.name');
                this.project = val;
            });
        },
    },
};
</script>

<style>

</style>
