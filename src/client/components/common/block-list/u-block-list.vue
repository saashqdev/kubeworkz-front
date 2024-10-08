<template>
  <div>
    <slot name="bread" />
    <u-crumb v-if="config.breads && config.breads.length">
      <u-crumb-item
        v-for="(item, idx) in config.breads"
        :key="idx"
        v-bind="item"
      >
        {{ item.text || item }}
      </u-crumb-item>
    </u-crumb>
    <slot name="desc" />
    <u-tip
      v-if="config.desc"
      :title="config.desc"
    />
    <u-linear-layout direction="vertical">
      <slot name="operation" />
      <u-linear-layout style="overflow:hidden;">
        <component
          :is="item.option.is"
          v-for="(item, idx) in operations"
          :key="idx"
          v-bind="item.option"
          v-on="item.listener"
        >
          {{ item.option.text }}
        </component>
      </u-linear-layout>
      <slot
        :list="list"
        :loading="loading"
        :loadError="loadError"
      />
      <u-page
        v-if="total > pageSize"
        :count="total"
        :total="Math.ceil(total / pageSize)"
        :page-size="pageSize"
        :page="page"
        @select="onSelectChange($event)"
      />
    </u-linear-layout>
  </div>
</template>

<script>
import normalizeOperation from './normalizeOperation';

export default {
    // pass base/mixins/u-block-list.js Introduce components
    // config: {
    //     breads: ['Product library'],
    //     operations: [
    //         { type: 'create', text: 'Create product library', click: () => {
    //             this.$refs.create.open();
    //         } },
    //         { type: 'refresh' },
    //         { type: 'search', search: (e) => {
    //             this.onSearch(e);
    //         } },
    //     ],
    //     getList: (vm, { page, pageSize }) => {
    //         const { keyword: query, sortField, sortDirection } = this;
    //         return archiveService.getLibraries({
    //             query: {
    //                 page: page - 1,
    //                 size: pageSize,
    //                 query,
    //                 sortField,
    //                 sortDirection,
    //             },
    //         })
    //             .then((res) => {
    //                 vm.list = res.data.elements;
    //                 vm.total = res.data.total;
    //             });
    //     },
    // },
    name: 'UBlockList',
    props: [ 'config' ],
    data() {
        return {
            list: [],
            total: 0,
            pageSize: 20,
            page: 1,
            loading: false,
            loadError: false,
        };
    },
    computed: {
        operations() {
            return this.config.operations.map(op => normalizeOperation(op, this));
        },
    },
    created() {
        this.refresh();
    },
    methods: {
        refresh() {
            this.loading = true;
            this.getList();
        },
        getList() {
            const { page, pageSize } = this;
            return this.config.getList(this, { page, pageSize })
                .then(() => {
                    this.loading = false;
                    this.loadError = false;
                }, err => {
                    this.list = [];
                    this.loading = false;
                    this.loadError = true;
                });
        },
        onSelectChange({ pageSize, page }) {
            this.pageSize = pageSize;
            this.page = page;
            this.getList();
        },
        goToPage(page) {
            this.page = page;
            this.getList();
        },
        goToPageWithLoading(page) {
            this.loading = true;
            this.goToPage(page);
        },
    },
};
</script>
