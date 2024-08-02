<template>
    <div :class="$style.root">
        <div v-show="false"><slot></slot></div>
        <u-linear-layout gap="small">
            <template v-for="(itemVM, index) in outsideVMs">
                <!-- The color data adds the primary style to the first button by default. Of course, this can be overridden through u-detail-operate-item. -->
                <u-create-element tag="u-button" :key="itemVM._uid"
                    v-bind="itemVM.$attrs" v-on="itemVM.$listeners" :color="itemVM.$attrs.color || (!index && isFirstPrimary && 'primary')"
                    :data="itemVM.$vnode.data" :children="itemVM.$slots.default">
                </u-create-element>
            </template>
            <u-popup v-if="insideVMs.length" :placement="placement" :trigger="trigger">
                <u-button>{{ menuTitle }} ▾</u-button>
                <u-menu slot="popper">
                    <template v-for="itemVM in insideVMs">
                        <u-create-element tag="u-menu-item" :key="itemVM._uid"
                            v-bind="itemVM.$attrs" v-on="itemVM.$listeners"
                            :data="itemVM.$vnode.data" :children="itemVM.$slots.default">
                        </u-create-element>
                    </template>
                </u-menu>
            </u-popup>
        </u-linear-layout>
    </div>
</template>
<script>
import { LinkList } from 'cloud-ui.vusion';
export default {
    name: 'u-detail-operate',
    childName: 'u-detail-operate-item',
    mixins: [LinkList],
    props: {
        isFirstPrimary: { type: Boolean, default: true },
        trigger: { type: String, default: 'click' },
    },
};
</script>
