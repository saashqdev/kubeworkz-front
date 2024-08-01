<template>
    <div :class="$style.root">
        <div :class="[$style.wrap, 'f-toe']" :showMoreButton="showMoreButton">
            <span v-if="isEmpty">-</span>
            <slot v-else name="display">
                <span v-for="(item, index) in briefList" :class="[$style.item, isChip ? 'u-chip' : '']" :key="index" :title="isString ? item : item.text">{{ isString ? item : item.text }}</span>
            </slot>
        </div>
        <u-popup v-if="showMoreButton" :trigger="trigger" :placement="placement">
            <slot name="more">
                <u-link style="padding-left: 5px; vertical-align: middle;">More</u-link>
            </slot>
            <div slot="title"><span style="margin-right: 32px;"><slot name="title">{{ title }}</slot></span> <span :class="$style.titleNum"><slot name="count"><template v-if="length">{{ length }} individual</template></slot></span></div>
            <div slot="content">
                <div :class="$style.popupBox">
                    <slot>
                        <div :class="$style.popupItem" v-for="(item, index) in list" :key="index">{{ isString ? item : item.text }}</div>
                    </slot>
                </div>
            </div>
        </u-popup>
    </div>
</template>

<script>
/**
 * @description An item in the list may be displayed in multiple units. If more items exceed the limit, they need to be hidden. Hover displays all items.
 *              Each item in the array is an object (the object has a text field to display) || String
 */
export default {
    name: 'u-table-cell-mores',
    props: {
        title: String,
        max: { type: Number, default: 1 },
        list: { type: Array, default: () => [] },
        isChip: { type: Boolean, default: false }, // Whether it is the style of the unit of u-chips component
        placement: {
            type: String,
            default: 'right',
        },
        trigger: {
            type: String,
            default: 'hover',
        },
    },
    computed: {
        length() {
            return this.list.length || 0;
        },
        briefList() {
            return this.list.slice(0, this.max < 0 ? 0 : this.max);
        },
        // Whether each item in the array is a string
        isString() {
            return typeof this.list[0] === 'string';
        },
        showMoreButton() {
            return this.length > this.max;
        },
        isEmpty() {
            if (this.max < 0)
                return false;
            return !this.list.length;
        },
    },
    data() {
        return {

        };
    },
};
</script>

<style module>
.root {
    /* display: inline-block; */
}
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

.titleNum {
    float: right;
    font-size: 12px;
    color: #999;
    padding: 1px 0;
}
.popupBox {
    max-height: 240px;
    overflow: auto;
    padding: 6px;
}
.popupItem {
    font-size: 12px;
}
.popupItem:not(:last-child) {
    border-bottom: 1px dashed #ccc;
    padding-bottom: 10px;
    margin-bottom: 10px;
}
</style>
