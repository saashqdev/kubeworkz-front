<template>
  <div :class="$style.chips">
    <span
      :class="$style.chip"
      @click="$emit('disable', !state)"
    >{{ state ? 'Take effect' :'Invalid' }}</span>
    <span
      :class="$style.chip"
      @click="$emit('edit')"
    >Edit</span>
    <span
      :class="$style.chip"
      @click="$emit('remove')"
    >Delete</span>
  </div>
</template>

<script>
export default {
    props: {
        state: Boolean,
    },
};
</script>

<style module>
.chips {
    border: 1px solid $brand-primary;
    border-radius: 12px;
    line-height: 12px;
    overflow: hidden;
}
.chip{
    display: inline-block;
    padding: 3px 3px;
    background-color: #fff;
    color: $brand-primary;
    font-size: 12px;
    border-right: 1px solid $brand-primary;
}
.chip:hover{
    background-color: $brand-primary;
    color: #fff;
}
.chips > .chip:first-child{
    padding-left: 9px;
}
.chips > .chip:last-child{
    padding-right: 9px;
    border-right: none;
}
</style>
