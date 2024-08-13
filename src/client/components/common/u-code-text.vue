<template>
  <div :class="$style.code">
    <div
      v-if="loading"
      class="f-tac"
    >
      <u-loading />
    </div>
    <div
      v-else
      :class="$style.content"
    >
      <pre :class="$style.text">{{ code }}</pre>
    </div>
  </div>
</template>
<script>
export default {
    name: 'UCodeText',
    props: {
        code: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
};
</script>
<style module>
.code{
    /* width: 700px; */
    padding: 10px;
    background-color: #f5f7f9;
}
.content{
    /* min-height: 215px; */
    overflow: scroll;
}
.text{
    /* margin: 0; */
    min-height: 20px;
    /* line-height: 20px; */
    color: #999;
}
</style>
