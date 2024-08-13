<template>
  <u-tooltip
    :placement="placement"
    :size="size"
  >
    <i :class="$style.help" />
    <div slot="content">
      <slot />
    </div>
  </u-tooltip>
</template>
<style module>
.help {
    position: relative;
    top: 2px;
    padding-left: 5px;
}
.help:after {
    color: #bac2cf;
    icon-font: url(@micro-app/common/icons/svg/help.svg);
}
</style>
<script>
// Hover up to show the simple components explained by the tooltip.

export default {
    name: 'UNote',
    props: {
        // The orientation of the tooltip display
        placement: { type: String, default: 'right' },
        size: { type: String, default: 'normal' },
    },
    data() {
        return {

        };
    },
};
</script>
