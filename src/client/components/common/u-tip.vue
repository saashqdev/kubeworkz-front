<template>
  <div :class="$style.root">
    <div :class="$style.title">
      {{ title }}
    </div>
    <slot name="cont" />
  </div>
</template>

<script>
export default {
    name: 'UTip',
    props: { title: { type: String } },
    data() {
        return {

        };
    },
};
</script>

<style module>
.root{
    display: block;
    margin-bottom: 20px;
    color: #666;
}
.title{
    display: inline-block;
}
</style>
