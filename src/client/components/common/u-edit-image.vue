<template>
    <div>
        <u-validate-input :style="'width:' + width" ref="input" size="huge" name="image" :rules="imageRules" v-model="image" @input="onChange" @validate="onValidate"></u-validate-input>
        <u-link style="padding-left: 10px;" @click="showModal = true">Select image</u-link>

        <u-select-image :show-modal.sync="showModal" :cluster-id="clusterId" :project-name="projectName" :tenant-name="tenantName" title="Select image" :image.sync="image" @change="onSelectImage"></u-select-image>
    </div>
</template>

<script>
import { Subscribe } from '@micro-app/common/base/mixins';

export default {
    name: 'u-edit-image',
    mixins: [Subscribe],
    props: {
        image: String,
        width: { type: String, default: '300px' },
        clusterId: [String, Number],
    },
    data() {
        return {
            projectName: '',
            tenantName: '',
            showModal: false,
            // The complete path (<path>:<tag>) consists of uppercase and lowercase letters, numbers, dashes, underlines, and English periods. Multiple paths are separated by "/"
            imageRules: [
                { type: 'string', required: true, trigger: 'input+blur', message: '' },
                { type: 'string', pattern: /^[a-z0-9]/, trigger: 'input+blur', message: 'Start with a lowercase letter or number' },
                { type: 'string', pattern: /^[a-zA-Z0-9-_.:/]*$/, trigger: 'input+blur', message: '' },
            ],
        };
    },
    subscribes: {
        loadCurInfos(data) {
            this.projectName = data.project.enName;
            this.tenantName = data.tenant.enName;
        },
    },
    methods: {
        onChange(event) {
            // This event is to update the image data of two-way binding (fake)
            this.$emit('update:image', event);
            // Here are events thrown to trigger other operations
            this.$emit('change');
        },
        onValidate(event) {
            this.$emit('validate', event);
        },
        onSelectImage(event) {
            // console.log(result);
            this.onChange(event);
            this.$nextTick(() => {
                this.$refs.input && this.$refs.input.validate();
            });
        },
    },
};
</script>

