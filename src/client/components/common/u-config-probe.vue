<template>
  <!-- <u-form gap="large" :class="$style.root"> -->
  <u-form
    :rules="rules"
    gap="large"
    @validate="pathValid = $event.valid"
  >
    <u-form-item
      v-if="!isLifecycle"
      label="Failure threshold"
    >
      <u-number-input
        v-model="model.failureThreshold"
        size="huge normal"
        :default-value="3"
        :min="1"
      /> Second-rate
    </u-form-item>
    <u-form-item
      v-if="!isLifecycle"
      label="Health threshold"
    >
      <u-number-input
        v-model="model.successThreshold"
        size="huge normal"
        :min="1"
        :disabled="type === 'liveness'"
      /> Second-rate
    </u-form-item>
    <u-form-item
      v-if="!isLifecycle"
      label="Initial waiting time"
    >
      <u-number-input
        v-model="model.initialDelaySeconds"
        size="huge normal"
        :min="0"
      /> Seconds
    </u-form-item>
    <u-form-item
      v-if="!isLifecycle"
      label="Monitoring interval"
    >
      <u-number-input
        v-model="model.periodSeconds"
        size="huge normal"
        :default-value="10"
        :min="1"
      /> Seconds
    </u-form-item>
    <u-form-item
      v-if="!isLifecycle"
      label="Detection timeout"
    >
      <u-number-input
        v-model="model.timeoutSeconds"
        size="huge normal"
        :default-value="1"
        :min="1"
      /> Seconds
    </u-form-item>
    <u-form-item label="Detection method">
      <u-capsules
        v-model="model.type"
        :data="types"
      />
    </u-form-item>
    <u-form-item
      v-show="model.type === 'exec'"
      label="Execute script"
      layout="block"
      required
    >
      <u-textarea-config
        ref="command"
        :class="$style.textarea"
        placeholder="Max 1024 characters, uppercase and lowercase letters are distinguished"
        err-message="Cannot exceed 1024 characters"
        :values="model.command"
        @change="onCommandChange"
      />
    </u-form-item>
    <u-form-item
      v-show="model.type !== 'exec'"
      label="Host"
    >
      <u-input
        v-model="model.host"
        :class="$style.input"
      />
    </u-form-item>
    <u-form-item
      v-show="model.type === 'httpGet'"
      label="Path"
      name="path"
      required
    >
      <u-input
        v-model="model.path"
        :class="$style.input"
        @input="onPathInput"
      />
    </u-form-item>
    <u-form-item
      v-show="model.type !== 'exec'"
      label="Port"
    >
      <u-number-input
        v-model="model.port"
        size="huge normal"
        :min="0"
        :max="65535"
      />
    </u-form-item>
    <!-- v-show is used here to avoid re-creating and deleting the u-inputs-header component when switching modes. -->
    <u-form-item
      v-show="model.type === 'httpGet'"
      label="Header"
      layout="block"
    >
      <u-inputs-header
        ref="header"
        :list="model.httpHeaders"
        size="small"
        @change="(model.httpHeaders = $event.value) && validate()"
        @validate="headerValid = $event.valid"
      />
    </u-form-item>
  </u-form>
</template>
<style module>
.root {
    margin-top: -9px;
}
.input {
    width: 460px;
}
.textarea {
    width: 460px;
}
</style>
<script>

import { mapComponents } from '@micro-app/common/utils';
import InputsHeader from './u-inputs-header.vue';
// enhance: data lost
// livenessProbe - Container running probe, readinessProbe - business running probe, lifecycle - life cycle
export default {
    name: 'UConfigProbe',
    components: mapComponents([ InputsHeader ]),
    props: {
        show: { type: Boolean, default: false }, // Mainly to allow the current component to execute validate after it is expanded.
        type: { type: String, default: 'liveness' },
        info: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            valid: false,
            headerValid: true,
            pathValid: false,
            types: [
                { value: 'exec', text: 'Script' },
                { value: 'httpGet', text: 'HTTP' },
                { value: 'tcpSocket', text: 'TCP' },
            ],
            model: {
                failureThreshold: 3, // Failure threshold
                successThreshold: 1, // Health threshold, for livenessProbe, must be 1
                initialDelaySeconds: 0, // Initial waiting time
                periodSeconds: 10, // Monitoring interval
                timeoutSeconds: 1, // Monitoring timeout
                type: 'exec',
                command: '',
                isCommandError: false,
                host: '',
                path: '',
                port: 8080,
                httpHeaders: [],
            },
            rules: {
                path: [
                    { type: 'string', required: true, trigger: 'input+blur', message: '' },
                    { type: 'string', pattern: /^\//, trigger: 'input+blur', message: 'To ... beginning' },
                ],
            },
        };
    },
    computed: {
        isLifecycle() {
            return this.type === 'lifecycle';
        },
    },
    watch: {
        'model.type': function() {
            this.validate();
        },
        show(value) {
            this.validate();
        },
    },
    created() {
        Object.keys(this.info).length && this.normalize();
        // this.$watch([this.model.host, this.model.path], () => this.validate());
    },
    methods: {
        normalize() {
            const { failureThreshold, successThreshold, initialDelaySeconds, periodSeconds, timeoutSeconds } = this.info;
            Object.assign(this.model, { failureThreshold, successThreshold, initialDelaySeconds, periodSeconds, timeoutSeconds });
            [ 'exec', 'httpGet', 'tcpSocket' ].forEach(item => {
                if (this.info[item]) {
                    this.model.type = item;
                    Object.assign(this.model, this.info[item]);
                }
            });
        },
        onCommandChange(event) {
            this.model.command = event.value;
            this.model.isCommandError = event.isError;
            this.validate();
        },
        onPathInput() {
            // The update of pathValid here is slower, and the input event callback of u-input is faster.
            setTimeout(() => this.validate());
        },
        validate() {
            const { type, command, path, isCommandError } = this.model;
            let valid = true;
            type === 'exec' && (valid = !!command && !isCommandError);
            type === 'httpGet' && (valid = !!path && this.pathValid && this.headerValid);
            this.valid = valid;
            // When the component is collapsed, the valid result must be true.
            this.$emit('validate', { valid: this.show ? valid : true });
            this.$emit('change', this.model);
        },
        $getData() {
            if (!this.valid) { return; }
            const {
                failureThreshold, successThreshold,
                initialDelaySeconds, periodSeconds, timeoutSeconds,
                type, command, host, path, port,
            } = this.model;

            // The lifecycle type only requires some parameters, and the change event does not differentiate.
            const tmp = { [type]: {} };
            !this.isLifecycle && Object.assign(tmp, { failureThreshold, successThreshold, initialDelaySeconds, periodSeconds, timeoutSeconds });

            type === 'exec' && (tmp.exec.command = this.$refs.command.$getData(command));
            type === 'httpGet' && Object.assign(tmp.httpGet, { host, path, port, httpHeaders: this.$refs.header.$getData() });
            type === 'tcpSocket' && Object.assign(tmp.tcpSocket, { host, port });
            return tmp;
        },
    },
};
</script>
