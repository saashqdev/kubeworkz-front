<template>
  <x-request
    ref="request"
    :service="service"
    :params="{
      params: {
      },
    }"
    :processor="resolver"
  >
    <template slot-scope="{ data, loading }">
      <i
        v-if="loading"
        class="el-icon-loading"
        style="font-size:24px"
      />
      <el-select
        v-else
        v-model="model"
        :disabled="disabled"
      >
        <el-option
          v-for="item in data"
          :key="item.value"
          :label="item.text"
          :value="item.value"
        />
      </el-select>
    </template>
  </x-request>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
import userService from 'kubeworkz/services/user';
import {
    setValueIfListNotPresent,
} from 'kubeworkz/utils/functional';
export default {
    mixins: [ makeVModelMixin ],
    props: {
        disabled: Boolean,
    },
    data() {
        return {
            service: userService.getUserTenants,
        };
    },
    computed: {
        user: get('scope/user.AccountId'),
    },
    methods: {
        resolver(response) {
            const items = (response.items || []).map(i => ({
                text: i.spec.displayName,
                value: i.metadata.name,
            }));
            setValueIfListNotPresent({
                list: items,
                path: 'value',
                current: this.model,
            }, val => {
                this.model = getFunc(val, 'value');
            });

            return items;
        },
    },
};
</script>

<style>

</style>
