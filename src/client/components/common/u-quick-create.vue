<template>
    <div :class="$style.root">
        If you need new {{ name }}，you can <u-link :to="to" :href="href" target="_blank" :class="$style.link" :disabled="disabled">create a {{ name }}</u-link>
        <u-refresh @click="$emit('refresh')" :loading="loading" :disabled="disabled"></u-refresh>
    </div>
</template>
<style module>
.root {
    color: #999;
    margin-top: 10px;
}
.link{
    margin-left: 5px;
}
</style>

<script>
export default {
    name: 'u-quick-create',
    props: {
        to: [Object, String],
        name: String,
        loading: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        href: { type: String },
    },
};
</script>

