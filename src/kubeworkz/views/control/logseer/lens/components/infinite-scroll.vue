<template>
    <div>
        <slot :displayData="displayData"></slot>
    </div>
</template>

<script>
let uniqueKey = 0;
function getContainerEl(el) {
    let node = el.parentNode;
    while (
        node &&
        node.tagName !== 'HTML' &&
        node.tagName !== 'BODY' &&
        node.nodeType === 1
    ) {
        if (node.hasAttribute('infinite-scroll-container')) {
            return node;
        }
        node = node.parentNode;
    }
    return node;
}
export default {
    props: {

        step: Number, // The number of data items loaded each time
        lazyRows: { type: Number, default: 10 }, // The number of pieces of data rendered each time
        normalizeData: Function, // Data normalization
        getDefaultData: Function, // Default data generation
        loadmoreFn: Function,
    },
    data() {
        return {
            displayData: [],
            offset: 0,
            // slots: [],
            data: [],
            containeElm: null,
            total: 0,
        };
    },
    mounted() {
        const container = getContainerEl(this.$el);
        this.containeElm = container;
        container.addEventListener('scroll', this.infiniteScroll);
        this.refresh();
    },
    beforeDestroy() {
        this.containeElm.removeEventListener('scroll', this.infiniteScroll);
    },
    methods: {
        reload() {
            this.containeElm.removeEventListener('scroll', this.infiniteScroll);
            const container = getContainerEl(this.$el);
            this.containeElm = container;
            container.addEventListener('scroll', this.infiniteScroll);
            this.refresh();
        },
        refresh() {
            const initFakeRows = this.total > this.lazyRows ? this.lazyRows : this.total;
            this.data = [];
            this.displayData = this.data.concat(new Array(initFakeRows).fill(this.getDefaultData()));
            this.offset = 0;
            this.firstLoad();
        },
        infiniteScroll(e) {
            const elm = this.containeElm;
            // console.log(elm.scrollTop, elm.clientHeight, elm.scrollHeight)
            if (elm.scrollTop + elm.clientHeight >= elm.scrollHeight) {
                this.loadMore();
            }
        },
        isContainerNotHitBottom() {
            const containerHeight = this.containeElm.getBoundingClientRect().height;
            const { height } = this.$el.getBoundingClientRect();

            return containerHeight > height;
        },
        formatDATA(d) {
            const t = this.normalizeData(d);
            t.uniqueKey = uniqueKey++;
            return t;
        },
        loadUntilFullScreen() {
            this.$nextTick(() => {
                if (this.isContainerNotHitBottom() && this.offset < this.total) {
                    this.loadMore();
                    this.loadUntilFullScreen();
                }
            });
        },
        firstLoad() {

            const {
                lazyRows, // Amount of lazy loading
                offset, // Current offset
                total, // Total amount
                step,
            } = this;
            this.loadmoreFn(this.offset).then(({ hits, total }) => {
                // this.total = total;
                this.data = hits.map(this.formatDATA);
                // Next, we need to solve the assignment of offset and displayData.
                const l = this.data.length;
                const offset = l;
                if (total > lazyRows) {
                    // if total >= lazyRows
                    this.displayData = this.data.slice(0, lazyRows);
                    this.offset = lazyRows;
                    this.loadUntilFullScreen();
                } else {
                    // if total < lazyRows
                    this.displayData = this.data.slice(0, total);
                    this.offset = total;
                }
                this.total = total;
            });
        },
        loadMore() {
            const {
                lazyRows, // Amount of lazy loading
                offset, // Current offset
                total, // Total amount
                step,
            } = this;

            const existDataLength = this.data.length;
            let newOffset = offset + lazyRows;
            newOffset = newOffset > total ? total : newOffset;
            if (existDataLength < newOffset) {
                // The length of the new data will be
                const remainsRow = total - offset > step ? step : total - offset;

                // Compare the existing data length with the calculated offset
                const dataPromise = this.loadmoreFn(this.offset);
                dataPromise.then(({ hits, total }) => {
                    this.data.splice(existDataLength, remainsRow, ...hits.map(this.formatDATA));
                    this.total = total;
                    this.displayData = this.data.slice(0, this.offset); // Must be this.offset
                }).catch(err => console.log(err));
                this.data = this.data.concat(new Array(remainsRow).fill(this.getDefaultData()));
            }

            this.displayData = this.data.slice(0, newOffset);
            this.offset = newOffset;
        },
    },
};
</script>

<style>

</style>
