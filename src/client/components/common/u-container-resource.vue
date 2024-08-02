<template>
    <div :class="$style.root">
        <u-form ref="form" gap="large">
            <u-form-item label="Basic configuration">
                <u-select v-model="type" size="large huge" :class="$style.select" @select="onSelect">
                    <u-select-item :value="0">Base performance (0.1 Cores / 128 MiB)</u-select-item>
                    <u-select-item :value="1">Average performance (0.5 Cores / 512 MiB)</u-select-item>
                    <u-select-item :value="2">High performance (1 Cores / 1024 MiB)</u-select-item>
                    <u-select-item :value="-1">Customize</u-select-item>
                </u-select>
            </u-form-item>
            <div v-show="type < 0" :class="$style.wrap">
                <u-form-item label="CPU" :class="$style.customItem">
                    <u-number-input size="huge normal" v-model="cpu" :min="0.001" :step="0.1" :precision="0.001" @change="onInput"></u-number-input> Cores
                </u-form-item>
                <u-form-item label="Memory" name="memory">
                    <u-number-input size="huge normal" v-model="memory" :min="1" :step="128" @change="onInput"></u-number-input> MiB
                </u-form-item>
            </div>
            <u-form-item label="Placement upper limit">
                Basic configuration x <u-number-input size="huge normal" v-model="multiple" :min="1" @change="onInput"></u-number-input>
                {{ (cpu * multiple).toFixed(3) }}Cores / {{ memory * multiple }}MiB
            </u-form-item>
            <u-form-item v-if="hasGPU" label="GPU configuration">
                <u-number-input size="huge normal" v-model="gpu" :min="0"></u-number-input> kernel
            </u-form-item>
        </u-form>
    </div>
</template>
<style module>
.root {
    margin-top: -5px;
}
.title {
    display: inline-block;
    padding: 20px 0 5px;
}
.wrap {
    margin-top: 20px;
}
.select[class] {
    width: 460px;
}
.customItem {
    margin-bottom: 10px;
}
</style>
<script>
const RESOURCE_REQUEST_MAP = [
    { cpu: 0.1, memory: 128 },
    { cpu: 0.5, memory: 512 },
    { cpu: 1, memory: 1024 },
];
// enhance: Under a single limits || requests object
export default {
    name: 'u-container-resource',
    props: {
        hasGPU: { type: Boolean, default: false }, // Is it possible to set gpu specifications
        // Including cpu, memory, multiple field information
        info: { type: Object, default: () => ({}) },
    },
    data() {
        const { cpu, gpu, memory, multiple } = this.info;
        const type = RESOURCE_REQUEST_MAP.findIndex((item) => item.cpu === cpu && item.memory === memory);
        return {
            type,
            cpu,
            gpu,
            memory,
            multiple,
        };
    },
    watch: {
        info(value) {
            Object.assign(this, value);
        },
    },
    methods: {
        getResource(cpu, memory, multiple = 1) {
            return {
                cpu: cpu * multiple * 1000 + 'm',
                memory: memory * multiple + 'Mi',
            };
        },
        // Get the middle value
        getInfo() {
            const { cpu, memory, multiple } = this;
            return { cpu, memory, multiple };
        },
        $getData(info) {
            info = info || this;
            const { cpu, gpu, memory, multiple } = info;
            const tmp = {};
            this.hasGPU && (tmp['nvidia.com/gpu'] = gpu);
            return {
                limits: Object.assign({}, this.getResource(cpu, memory, multiple), tmp),
                requests: Object.assign({}, this.getResource(cpu, memory), tmp),
            };
        },
        onSelect() {
            if (this.type < 0) {
                this.cpu = 0.1;
                this.memory = 128;
            } else
                Object.assign(this, RESOURCE_REQUEST_MAP[this.type]);

            this.$emit('change', this.getInfo());
        },
        onInput() {
            this.$emit('change', this.getInfo());
        },
    },
};
</script>
