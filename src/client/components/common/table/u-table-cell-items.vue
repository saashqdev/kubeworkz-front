<template>
  <div>
    <div
      :class="[$style.wrap, 'f-toe']"
      :showMoreButton="showMoreButton"
    >
      <span v-if="isEmpty">-</span>
      <span
        v-for="(item, index) in briefList"
        v-else
        :key="index"
        :class="[$style.item, isChip ? 'u-chip' : '']"
        :title="isString ? item : item.text"
      >{{ isString ? item : item.text }}</span>
    </div>
    <u-tooltip v-if="showMoreButton">
      <u-link style="padding-left: 5px;">
        More
      </u-link>
      <div slot="content">
        <div
          v-for="(item, index) in list"
          :key="index"
        >
          {{ isString ? item : item.text }}
        </div>
      </div>
    </u-tooltip>
  </div>
</template>

<style module>
.wrap {
    display: inline-block;
    max-width: 100%;
    vertical-align: middle;
}

.wrap[showMoreButton] {
    max-width: calc(100% - 40px);
}

.item[class] {
    max-width: 100%;
}
</style>

<script>
/**
 * @description An item in the list may be displayed in multiple units. If more items exceed the limit, they need to be hidden. Hover displays all items.
 *              Each item in the array is an object (the object has a text field to display) || String
 */
export default {
    name: 'UTableCellItems',
    props: {
        max: { type: Number, default: 1 },
        list: { type: Array, default: () => [] },
        isChip: { type: Boolean, default: false }, // Whether it is the style of the unit of u-chips component
    },
    data() {
        return {

        };
    },
    computed: {
        length() {
            return this.list.length || 0;
        },
        briefList() {
            return this.list.slice(0, this.max);
        },
        // Whether each item in the array is a string
        isString() {
            return typeof this.list[0] === 'string';
        },
        showMoreButton() {
            return this.length > this.max;
        },
        isEmpty() {
            return !this.list.length;
        },
    },
};
</script>
