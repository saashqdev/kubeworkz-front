<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout direction="horizontal">
        <u-button
          icon="create"
          color="primary"
          @click="create"
        >
          Add key
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
      </u-linear-layout>

      <x-request
        ref="request"
        :service="service"
        :params="{}"
        :processor="resolver"
      >
        <template slot-scope="{ data, loading, error }">
          <kube-table
            table-width="100%"
            :loading="loading"
            :columns="columns"
            :items="data ? data.list : []"
            :error="error"
          >
            <template #[`item.metadata.creationTimestamp`]="{ item }">
              {{ item.metadata.creationTimestamp | formatLocaleTime }}
            </template>
            <template #[`item.operation`]="{item}">
              <u-linear-layout>
                <u-linear-layout gap="small">
                  <span>Properties format</span>
                  <u-easy-copy :text="'accessKey=' + item.metadata.name + '\n' + 'secretKey=' + item.spec.secretKey" />
                </u-linear-layout>
                <u-linear-layout gap="small">
                  <span>yaml format</span>
                  <u-easy-copy :text="'accessKey: ' + item.metadata.name + '\n' + 'secretKey: ' + item.spec.secretKey" />
                </u-linear-layout>
                <u-link @click="remove(item)">
                  Delete
                </u-link>
              </u-linear-layout>
            </template>
            <template #error>
              Failed to obtain data, please<u-link @click="refresh">
                Try agaain
              </u-link>
            </template>
          </kube-table>
          <u-page
            v-if="data && calculatePages(data.total) > 1"
            :count="data.total"
            :page-size="pagination.pageSize"
            :total="calculatePages(data.total)"
            @select="selectPage"
          />
        </template>
      </x-request>
    </u-linear-layout>
  </div>
</template>

<script>
import { get } from 'lodash';
import userService from 'kubeworkz/services/user';
import PageMixin from 'kubeworkz/mixins/pagination';

export default {
    components: {
        // UserUploadDialog,
    },
    metaInfo: {
        title: 'User - kubeworkz',
    },
    mixins: [ PageMixin ],
    data() {
        return {
            service: userService.getUserKey,
            columns: [
                { name: 'metadata.name', title: 'AccessKey' },
                { name: 'spec.secretKey', title: 'SecretKey' },
                { name: 'metadata.creationTimestamp', title: 'Creation time', width: '180px' },
                { name: 'operation', title: 'Operation', width: '180px' },
            ],
        };
    },
    methods: {
        resolver(result) {
            console.log(result);
            // const r = {
            //     list: get(result, 'items', []).map(i => toPlainObject(i)),
            //     total: get(result, 'total', 0),
            // };
            // console.log(r);
            return {
                list: result.items,
                total: result.total,
            };
        },
        refresh() {
            this.$refs.request.request();
        },
        async create() {
            await userService.createUserKey();
            this.refresh();
        },
        async remove(item) {
            this.$confirm({
                title: 'Delete',
                content: `Confirm to delete ${item.metadata.name}?`,
                ok: async () => {
                    await userService.removeUserKey({
                        params: {
                            accessKey: item.metadata.name,
                        },
                    });
                    this.refresh();
                },
            });
        },

    },

};
</script>

<style>

</style>
