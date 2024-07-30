/**
 * Mixins provide:
 *  1. The loadList method of the list interface has been enhanced to obtain status loading and loadError.
 *     The loadList method needs to be defined, and the return value needs to be promise or true (true represents a delayed call to loadList, and the user needs to grasp the timing of the call).
 *     At the same time, list total needs to be assigned a value.
 *  2. Whether there is any remaining quota hasQuota (default is true, the actual remaining quota will be returned if there is data)
 *     You need to define the loadQuota method (optional) mainly to obtain the quota, and at the same time, you need to assign a quota to quota.
 *  3. The paging control event responds to changePage and provides the totalPage page value.
 *  4. Provides a method to obtain the parameters for calling the remote interface, supporting parameter passing, eg: getFormForOAI({other: 1})
 * getForm (used for the interface to send offset and limit), getFormForOAI (used for the interface to send Offset and Limit), getFormForPage (used for the interface to send pageNum and pageSize)
 *  5. Provides a method for safely deleting instances, which is used when there is only one entry on the last page. At the same time, the deleting attribute will be automatically added to the instance.
 *     The deleteItem method needs to be defined, and the return value needs to be promise or true (true represents a delayed call to deleteItem)
 *
 */
import storage from '../storage/localStorage.js';

export default {
    created() {
        this.loadListSource = this.loadList; // cache this
        this.deleteItemSource = this.deleteItem; // cache this
        this.deleteItem = this.deleteItemWrap;
        this.updateItemSource = this.updateItem; // cache this
        this.updateItem = this.updateItemWrap;
        this.loadList = this.loadListWrap;
        // Restore paging granularity and page numbers
        if (this.needRestorePage) {
            const currentPageName = this.$route.name;
            const name = currentPageName.substring(currentPageName.indexOf('.') + 1);
            this.urlPageName = `${name}.page`;
            this.limitStorageId = `page-limit-${currentPageName}`;
            let limit = storage.get(this.limitStorageId);
            const urlPageData = this.$route.query[this.urlPageName] || '';
            // There is limit in localStorage, or page information in route, which means it has been set and the url needs to be set.
            if (limit || urlPageData) {
                limit = this.checkLimit(+limit);
                const pageData = urlPageData.split('_');
                const urlPage = +pageData[1] || this.page;
                let urlLimit = pageData[0] ? this.checkLimit(+pageData[0]) : '';
                urlLimit = urlLimit || limit; // The limit on the url takes precedence
                this.updateUrl({ limit: urlLimit, page: urlPage });
                storage.set(this.limitStorageId, urlLimit);
            } else {
                this.loadListWhenCreated && this.loadList();
            }
        } else {
            this.loadListWhenCreated && this.loadList();
        }
        this.loadQuota && this.loadQuota();
    },
    beforeRouteLeave(to, from, next) {
        if (this.needRestorePage) {
            // If you are not jumping to a subpage of the list page, delete the page parameter of the current page.
            const children = from.meta.children || [];
            const toSubPage = children.some((item) => to.path.startsWith(item));
            // The creation page is a subpage. After creation, you need to jump to the first page. There is no need to retain paging information.
            const noPageInfo = from.meta.noPageInfo || [];
            const toNoPageInfo = noPageInfo.some((item) => to.path.startsWith(item));
            if (!toSubPage || toNoPageInfo) {
                this.resetPageUrl();
            }
        }
        next();
    },
    beforeRouteUpdate(to, from, next) {
        // List refresh issue when dealing with browser rollback history
        if (this.needRestorePage) {
            const query = to.query;
            const pageData = query[this.urlPageName] ? query[this.urlPageName].split('_') : [];
            const limit = this.checkLimit(+pageData[0]);
            const page = +pageData[1] || 1; // If page is not set, return to the first page
            if (limit !== this.form.limit || page !== this.page) {
                const dataTemp = {
                    limit,
                    page,
                };
                this.updatePageData(dataTemp);
                this.refresh();
            }
        }
        next();
    },
    data() {
        const result = this.reset(true);
        return {
            form: result.form,
            page: result.page,
            totalPage: result.totalPage,
            total: result.total,
            limitList: result.limitList,
            loading: false,
            loadError: false,
            list: [],
            quota: 0,
            totalAll: 0,
            loadListWhenCreated: true, // The list in the pop-up window does not require loadList when created
        };
    },
    computed: {
        hasQuota() {
            const list = this.list;
            const quota = this.quota;
            const total = this.total;
            const totalAll = this.totalAll;
            if ((total || list || totalAll) && quota)
                return quota - (totalAll || total || list.length) > 0;
            return true;
        },
    },
    methods: {
        refresh() {
            this.loadList();
        },
        reset(isInit) {
            const limitList = [20, 50, 100];
            const data = {
                form: {
                    offset: 0,
                    limit: limitList[0],
                },
                page: 1,
                totalPage: 1,
                total: 0,
                limitList,
            };
            if (isInit)
                return data;
            else {
                Object.assign(this.form, data.form);
                this.page = data.page;
                this.totalPage = data.totalPage;
                this.total = data.total;
            }
        },
        resetAll() {
            this.total = 0;
            this.reset();
        },
        previousPage() {
            this.page -= 1;
            this.changePage({ page: this.page });
        },
        changePage($event) {
            if (this.needRestorePage) {
                this.updateUrl({ page: $event.page });
            } else {
                this.form.offset = ($event.page - 1) * this.form.limit;
                this.loadList();
            }
        },
        loadListWrap(params) {
            const req = this.wrap('loadListSource', params);
            if (req) {
                this.list = [];
                this.loading = true;
                this.loadError = false;
                req.then(() => {
                    if (this.list && !this.list.length && this.form.offset !== 0) {
                        if (this.needRestorePage) {
                            this.updateUrl({ page: 1 });
                        } else {
                            this.form.offset = 0;
                            this.page = 1;
                            this.loadList();
                        }
                    } else if (this.list) {
                        this.loading = false;
                        const { offset, limit } = this.form;
                        this.page = Math.ceil((this.list.length + offset) / limit);
                        this.totalPage = Math.ceil(this.total / limit) || 1;
                    }
                }, () => {
                    this.loading = false;
                    this.loadError = true;
                });
            }
        },
        wrap(source, params) {
            const req = this[source](params);
            if (req === true) {
                // Not executed
                return false;
            }
            // if (DEV) {
            //     if (!req || !req.then) {
            //         console.error('Must return promise or true (do not execute)');
            //         return false;
            //     }
            // }
            return req;
        },
        deleteItemWrap(item) {
            if (item.deleting)
                return;
            const req = this.wrap('deleteItemSource', item);
            if (req) {
                this.$set(item, 'deleting', true);
                req.then(() => {
                    item.deleting = false;
                    // Delete the last page and automatically return to the previous page
                    if (this.list.length === 1) {
                        if (this.needRestorePage) {
                            const page = this.page - 1;
                            this.updateUrl({ page: page <= 0 ? 1 : page });
                            return;
                        } else {
                            const prev = this.page - 2;
                            this.form.offset = (prev < 0 ? 0 : prev) * this.form.limit;
                        }
                    }
                    this.loadList();
                }, () => {
                    item.deleting = false;
                });
            }
        },
        updateItemWrap(item) {
            if (item.updating)
                return;
            const req = this.wrap('updateItemSource', item);
            if (req) {
                this.$set(item, 'updating', true);
                req.then(() => {
                    item.updating = false;
                    this.loadList();
                }, () => {
                    item.updating = false;
                });
            }
        },
        getForm(ops) {
            return Object.assign({}, this.form, ops);
        },
        getFormForOAI(ops) {
            const { offset, limit } = this.form;
            return Object.assign({
                Offset: offset,
                Limit: limit,
            }, ops);
        },
        getFormForPage(ops) {
            const { offset, limit } = this.form;
            return Object.assign({
                pageNum: (Math.ceil(offset / limit) + 1) || 1,
                pageSize: limit,
            }, ops);
        },
        /**
         * Modify paging granularity
         */
        changeLimit($event) {
            // After the limit changes, the total number of paging will also change, so total needs to be reset so that the paging control does not display.
            this.resetToPage1({ limit: $event.value });
            storage.set(this.limitStorageId, $event.value);
        },
        /**
         * Update limit and page in the list
         * Get it from the url uniformly
         */
        updatePageData(data) {
            this.form.limit = +data.limit;
            this.page = +data.page;
            this.form.offset = (this.page - 1) * this.form.limit;
        },
        /**
         * When the limit or page changes, update the url
         */
        updateUrl(data = {}) {
            const dataTemp = Object.assign({
                limit: this.form.limit,
                page: this.page,
            }, data);
            const query = Object.assign({}, this.$route.query);
            const urlPageName = this.urlPageName;
            query[urlPageName] = [dataTemp.limit, dataTemp.page].join('_');
            this.changeQueryUrl(query);
            this.updatePageData(dataTemp);
            this.refresh();
        },
        /**
         * When the sublist exits, the last bit of the page needs to be cleared.
         */
        resetPageUrl() {
            const query = this.$route.query;
            if (query[this.urlPageName]) {
                delete query[this.urlPageName];
            }
        },
        checkLimit(limit) {
            if (this.limitList.includes(limit))
                return limit;
            return this.limitList[0];
        },
        resetToPage1(data = {}) {
            this.totalPage = 0;
            this.updateUrl(Object.assign(data, { page: 1 }));
        },
    },
};

