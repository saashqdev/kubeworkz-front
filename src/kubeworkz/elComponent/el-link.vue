<template>
  <a
    :class="[
      'el-link',
      type ? `el-link--${type}` : '',
      linkSize ? 'el-link--' + linkSize : '',
      disabled && 'is-disabled',
      underline && !disabled && 'is-underline',
    ]"
    :href="disabled ? null : linkHref"
    v-bind="$attrs"
    @click="handleClick"
  >

    <i
      v-if="icon"
      :class="icon"
    />
    <span
      v-if="$slots.default"
      class="el-link--inner"
    >
      <slot />
    </span>

    <template v-if="$slots.icon">
      <slot
        v-if="$slots.icon"
        name="icon"
      />
    </template>
  </a>
</template>

<script>
// Rewrite el-link to enhance capabilities
export default {
    name: 'ElLink',

    inject: {
    //   elForm: {
    //     default: ''
    //   },
        elFormItem: {
            default: '',
        },
    },

    props: {
        type: {
            type: String,
            default: 'default',
        },
        underline: {
            type: Boolean,
            default: false,
        },
        disabled: Boolean,
        href: String,
        icon: String,
        size: String,
        to: Object,
    },
    computed: {
        _elFormItemSize() {
            return (this.elFormItem || {}).elFormItemSize;
        },
        // Reuse input first
        linkSize() {
            return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        },
        linkHref() {
            if (typeof window === 'undefined') return;
            if (this.to && this.$router && this.$router.resolve) {
                const routeData = this.$router.resolve(this.to); // Parse through built-in API
                if (routeData) { // get href
                    const pathname = window.location.pathname || '';
                    const href = routeData.href;
                    if (href.startsWith('#')) { // Compatible with base tag
                        return pathname + href;
                    }
                    return href;
                }
            }
            return this.href;
        },
    },
    methods: {
        handleClick(event) {
            if (!this.disabled) {
                if (!this.href) {
                    this.$emit('click', event);
                }
            }
        },
    },
};
</script>
