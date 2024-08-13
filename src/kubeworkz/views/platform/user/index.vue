<template>
  <div>
    <u-linear-layout direction="vertical">
      <u-linear-layout direction="horizontal">
        <u-button
          icon="create"
          color="primary"
          @click="openCreateModal"
        >
          Add new user
        </u-button>
        <u-button
          icon="create"
          color="primary"
          @click="$refs.upload.open()"
        >
          Batch import
        </u-button>
        <u-button
          icon="refresh"
          square
          @click="refresh"
        />
      </u-linear-layout>

      <x-request
        ref="request"
        :service="userService"
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
            <template #[`item.lastLoginTime`]="{ item }">
              {{ item.lastLoginTime | formatLocaleTime }}
            </template>
            <template #[`item.state`]="{ item }">
              {{ item.state | formatStatus }}
            </template>
            <template #[`item.operation`]="{item}">
              <u-link-list>
                <u-link-list-item @click="edit(item)">
                  Modify information
                </u-link-list-item>
                <u-link-list-item @click="editPWD(item)">
                  Change password
                </u-link-list-item>
                <u-link-list-item @click="editStatus(item)">
                  {{ item.state === 'normal' ? 'Disable' : 'Enable' }}
                </u-link-list-item>
              </u-link-list>
            </template>
            <template #error>
              Failed to obtain data, please<u-link @click="refresh">
                Try again
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
    <!-- <comp
      :columns="columns"
      :items="items"
    >
      <template
        #[`item.a`]="{ item }"
      >
        <span>{{ item.a }}</span>
      </template> -->
    <!-- <template
        #[`item.b`]="{ item }"
      >
        {{ item.b }}
      </template> -->
    <!-- </comp> -->
    </u-linear-layout>
    <user-dialog
      ref="user"
      @refresh="refresh"
    />
    <user-upload-dialog ref="upload" />
  </div>
</template>

<script>
import { get } from 'lodash';
import userService from 'kubeworkz/services/user';
import PageMixin from 'kubeworkz/mixins/pagination';
import userDialog from './user-dialog.vue';
import UserUploadDialog from './user-upload-dialog.vue';
export default {
    components: {
        userDialog,
        UserUploadDialog,
    },
    metaInfo: {
        title: 'User management - kubeworkz',
    },
    filters: {
        formatStatus(val) {
            if (val === 'normal') {
                return 'Enable';
            }
            return 'Disable';

        },
    },
    mixins: [ PageMixin ],
    data() {
        return {
            userService: userService.getUserList,
            columns: [
                { name: 'name', title: 'Login account' },
                { name: 'displayName', title: 'Username' },
                { name: 'loginType', title: 'Type' },
                { name: 'lastLoginIP', title: 'Last login IP' },
                { name: 'lastLoginTime', title: 'Last login time', width: '200px' },
                { name: 'state', title: 'State', width: '100px' },
                { name: 'operation', title: 'Operation', width: '200px' },
            ],
        };
    },
    methods: {
        resolver(result) {
            const r = {
                list: get(result, 'items', []).map(i => ({
                    name: i.name,
                    ...i.spec,
                    ...i.status,
                })),
                total: get(result, 'sum', 0),
            };
            return r;
        },
        refresh() {
            this.$refs.request.request();
        },
        edit(user) {
            this.$refs.user.open(user);
        },
        editPWD(user) {
            this.$refs.user.open(user, true);
        },
        async editStatus(item) {
            const nextStatus = item.state === 'normal' ? 'forbidden' : 'normal';
            await userService.modifyUser({
                pathParams: {
                    user: item.name,
                },
                data: {
                    spec: {
                        state: nextStatus,
                    },
                },
            });
            this.refresh();
        },
        openCreateModal() {
            this.$refs.user.open();
            console.log(this.$refs.user);
        },
    },

};
// import makePagenationMixin from 'kubeworkz/components/src/ui/mixins/pagination';
// import userService from 'kubeworkz/services/user';
// import UserDialog from './user-dialog.vue';
// import UserUploadDialog from './user-upload-dialog.vue';
// export default {
//     components: {
//         UserDialog,
//         UserUploadDialog
//     },
//     metaInfo: {
//         title: 'kubeworkz',
//         titleTemplate: '%s - User'
//     },
//     extends: makePagenationMixin,
//     data: () => ({
//         total: 0,
//         list: [],
//         loading: true,

//         editedItem: null,
//         dialogVisible: false,
//     }),
//     computed: {
//         headers(){
//             return [
//                 { text: this.$t('Account'), sortable: false, value: 'name' },
//                 { text: this.$t('AccountName'), value: 'displayName', sortable: false},
//                 { text: this.$t('Type'), value: 'loginType', sortable: false},
//                 { text: this.$t('lastLoginIP'), value: 'lastLoginIP', sortable: false},
//                 { text: this.$t('lastLoginTime'), value: 'lastLoginTime', sortable: false},
//                 { text: this.$t('Operation'), value: 'operation', sortable: false },
//             ];
//         }
//     },
//     watch: {
//         '$route.query'() {
//             this.getDataFromApi();
//         },
//     },
//     created() {
//         this.getDataFromApi();
//     },
//     methods: {
//         editItem(item){
//             this.editedItem = item;
//             this.$refs.userDialog.dialog = true;
//         },
//         getDataFromApi () {
//             this.loading = true;
//             this.requestUserList().then(data => {
//                 this.list = data.items;
//                 this.total = data.total;
//                 this.loading = false;
//             });
//         },
//         async requestUserList() {
//             try {
//                 const response = await userService.getUserList({
//                     params: this.pagination
//                 });
//                 return {
//                     items: response.items.map(i => ({
//                         name: i.name,
//                         ...i.spec,
//                         ...i.status,
//                     })),
//                     total: response.sum,
//                 };
//             } catch(err) {
//                 return {
//                     items: [],
//                     total: 0,
//                 };
//             }
//         },
//         onDialogClose() {
//             this.editedItem = null;
//             console.log('closed');
//         },
//         onDialogCommit() {
//             this.editedItem = null;
//             this.getDataFromApi();
//         }
//     },
// };
</script>

<style>

</style>
