<template>
  <div
    ref="notes"
    :class="[$style.tagsWrapper, showCollapse ? $style.collapse : '']"
  >
    <span v-if="!lists.length">-</span>
    <template v-else>
      <span
        v-for="(list, i) in curLists"
        :key="i"
        :title="list"
        :class="$style.tags"
      >{{ list }}</span>
      <span
        v-if="showCollapse"
        :class="$style.more"
        @click="onClickMore"
      >More</span>
    </template>

    <u-modal
      :visible.sync="viewMore"
      title="See more"
      size="huge"
    >
      <div
        v-for="(item, index) in lists"
        :key="index"
        class="u-chip"
        :title="item"
      >
        {{ item }}
      </div>
      <div slot="foot" />
    </u-modal>
  </div>
</template>
<style module>
.tagsWrapper {
    margin-bottom: -10px;
}
.tags {
    max-width: 100%;
    margin: 0 10px 10px 0;
    padding: 0 10px 0 10px;
    border-radius: 12px;
    font-size: 14px;
    color: #666;
    display: inline-block;
    vertical-align: middle;
    background-color: #eef2f7;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.tagsWrapper.collapse {
    overflow: hidden;
    padding-right: 45px;
}

.more {
    position: absolute;
    right: 0;
    bottom: 12px;
    cursor: pointer;
    color: $brand-primary
}

.more:hover {
    text-decoration: underline;
}
</style>

<script>
export default {
    name: 'ULabels',
    props: {
        lists: Array,
        noCollapse: { type: Boolean, default: false }, // Use folding by default, show more
    },
    data() {
        return {
            viewMore: false,
        };
    },
    computed: {
        showCollapse() {
            return !this.noCollapse && this.shouldDisplayCollapseBtn;
        },
        shouldDisplayCollapseBtn() {
            return this.lists.length > 2;
        },
        curLists() {
            return this.showCollapse ? this.lists.slice(0, 2) : this.lists;
        },
    },
    methods: {
        onClickMore() {
            this.viewMore = true;
            this.$emit('clickMore', {
                sender: this,
            });
        },
    },
};
</script>
