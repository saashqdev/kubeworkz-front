<template>
  <div>
    <el-form-item
      label="Deployment strategy"
    >
      <el-switch
        v-if="!hostNetworkSupport"
        v-model="model.enable"
      />
      <template
        v-if="model.enable"
      >
        <affinity-config
          v-model="model.nodeAffinity"
          type="nodeAffinity"
          :required="hostNetworkSupport"
          :prefix-prop="`${prefixProp}.nodeAffinity`"
        />
        <affinity-config
          v-model="model.podAffinity"
          type="podAffinity"
          :prefix-prop="`${prefixProp}.podAffinity`"
        />
        <affinity-config
          v-model="model.podAntiAffinity"
          type="podAntiAffinity"
          :required="hostNetworkSupport"
          :prefix-prop="`${prefixProp}.podAntiAffinity`"
        />
        <toleration-config
          v-model="model.tolerations"
          :prefix-prop="`${prefixProp}.tolerations`"
        />
      </template>
    </el-form-item>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import affinityConfig from './affinity-config.vue';
import tolerationConfig from './toleration-config.vue';
export default {
    components: {
        affinityConfig,
        tolerationConfig,
    },
    mixins: [ makeVModelMixin ],
    props: {
        hostNetworkSupport: {
            type: Boolean,
            default: false,
        },
        prefixProp: {
            type: String,
            default: '',
        },
    },
    watch: {
        hostNetworkSupport(val) {
            if (val) {
                this.model.enable = false;
                this.$nextTick(() => {
                    this.model.enable = true;
                });
            }
        },
    },
};
</script>

<style>

</style>
