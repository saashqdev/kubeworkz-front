<template>
  <u-input
    :value="query"
    size="normal large"
    placeholder="Please enter traceId"
    @keypress="onKeyPress"
    @change="onChange"
  />
</template>

<script>
import { mapState } from 'vuex';
export default {
    inject: [ 'forceToRefresh' ],
    computed: mapState({
        query: state => state.lens.query,
    }),
    methods: {
        onChange(e) {
            this.$store.commit('lens/setQuery', e.value || '');
        },
        onKeyPress(e) {
            if (e.keyCode === 13) {
                this.forceToRefresh();
            }
        },
    },
};
</script>

<style>

</style>
