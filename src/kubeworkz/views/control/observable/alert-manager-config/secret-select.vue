<template>
  <x-request
    ref="request"
    :service="service"
    :params="params"
    :processor="resolver"
  >
    <template slot-scope="{ loading }">
      <u-loading v-if="loading" />
      <u-linear-layout
        v-else
        direction="vertical"
      >
        <u-select
          v-if="secrets.length > 0"
          v-model="model.name"
          :data="secrets"
          size="large"
        />
        <u-select
          v-else
          size="large"
          value="No Secrets yet"
          disabled
        />

        <u-select
          v-if="secrets.length > 0 && model.name"
          v-model="model.key"
          :data="secretKeys"
          size="large"
        />
        <u-select
          v-else
          size="large"
          value="No Key yet"
          disabled
        />
      </u-linear-layout>
    </template>
  </x-request>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import workloadService from 'kubeworkz/services/k8s-resource';
import { toPlainObject as toMetadataPlainObject } from 'kubeworkz/k8s-resources/metadata.js';
import {
    setValueIfListNotPresent,
} from 'kubeworkz/utils/functional';

export default {
    mixins: [ makeVModelMixin ],
    data() {
        return {
            service: workloadService.getAPIV1,
            secrets: [],
        };
    },
    computed: {
        namespace: get('scope/project@spec.namespace'),
        cluster: get('scope/cluster@value'),
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'secrets',
                },
                params: {
                    pageSize: 10000,
                },
            };
        },
        secretKeys() {
            if (!this.model.name || !this.secrets.length) return [];
            const currentSecret = this.secrets.find(s => s.value === this.model.name);
            if (!currentSecret) return [];
            return currentSecret.keys;
        },
        // modelValue: {
        //     get() {
        //         return getFunc(this.model, 'value', null);
        //     },
        //     set(val) {
        //         this.model = this.list.find(m => m.value === val);
        //     },
        // },
    },
    methods: {
        resolver(response) {
            const list = [{ text: 'Don\'t choose yet', value: '' }, ...response.items.map(i => {
                const p = toMetadataPlainObject(i);
                return {
                    text: p.name,
                    value: p.name,
                    keys: Object.keys(i.data).map(k => ({ text: k, value: k })),
                };
            }) ];
            this.secrets = list;
            let keys = null;
            setValueIfListNotPresent({
                list,
                path: 'value',
                current: getFunc(this.model, 'name'),
            }, val => {
                keys = getFunc(val, 'keys');
                this.model.name = getFunc(val, 'value');
            });

            if (keys) {
                setValueIfListNotPresent({
                    list: keys,
                    path: 'value',
                    current: getFunc(this.model, 'key'),
                }, val => {
                    this.model.key = getFunc(val, 'value');
                });
            }
        },
    },

};
</script>

<style>

</style>
