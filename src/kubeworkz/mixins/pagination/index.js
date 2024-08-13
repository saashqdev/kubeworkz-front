export default {
    data() {
        return {
            pagination: {
                pageNum: 1,
                pageSize: 10,
                sortOrder: '',
                sortName: undefined,
                selector: '',
                sortFunc: 'string',
            },
        };
    },
    computed: {
        defaultSort() {
            const valueMap = { desc: 'descending', asc: 'ascending' };
            return {
                prop: this.pagination.sortName,
                order: valueMap[this.pagination.sortOrder],
            };
        },
    },
    methods: {
        selectPage($event) {
            this.pagination.pageNum = $event.page;
            this.pagination.pageSize = $event.pageSize;
        },
        calculatePages(total) {
            return Math.ceil(total / this.pagination.pageSize);
        },
        pageSizeChange(pageSize) {
            this.pagination.pageSize = pageSize;
        },
        pageNumChange(pageNum) {
            console.log(pageNum);
            this.pagination.pageNum = pageNum;
        },
        tableSortChange({ prop, order }) {
            const valueMap = { descending: 'desc', ascending: 'asc' };
            this.pagination.sortName = `${prop}`;
            this.pagination.sortOrder = valueMap[order];
            this.pagination.sortFunc = prop === 'metadata.creationTimestamp' ? 'time' : 'string';
        },
    },
};
