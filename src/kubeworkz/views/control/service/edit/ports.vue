<template>
  <div>
    <el-form-item
      label="Ports"
      :prop="prefixProp"
      :rules="[
        ...(required ? [ validators.required() ] : []),
        validators.arrayRequired(required ? ( isNodePort ? ['name', 'targetPort', 'port'] : ['name', 'targetPort', 'port']) : ''),
      ]"
      :class="$style.wrapFromItem"
    >
      <dynamicBlock
        v-model="model"
        :get-default-item="getDataTemplate"
        :columns="[
          {
            title: 'TargetPort',
            dataIndex: 'targetPort',
          },
          {
            title: 'Protocol',
            dataIndex: 'protocol',
          },
          {
            title: 'Service port',
            dataIndex: 'port',
          },
          ...(isNodePort ? [ { title: 'NodePort', dataIndex: 'nodePort' }] : []),
          {
            title: 'Name',
            dataIndex: 'name'
          }
        ]"
      >
        <template slot="th-targetPort">
          Target port
          <el-tooltip
            effect="dark"
            placement="right"
            popper-class="ncs-el-tooltip-popper"
          >
            <template slot="content">
              Pod port
            </template>
            <i class="el-icon-question" />
          </el-tooltip>
        </template>
        <template slot="th-port">
          Service port
          <el-tooltip
            effect="dark"
            placement="right"
            popper-class="ncs-el-tooltip-popper"
          >
            <template slot="content">
              The port used to access the service within the k8s cluster
            </template>
            <i class="el-icon-question" />
          </el-tooltip>
        </template>
        <template slot="th-nodePort">
          NodePort
          <el-tooltip
            effect="dark"
            placement="right"
            popper-class="ncs-el-tooltip-popper"
          >
            <template slot="content">
              NodePort is the access port forwarded through the node. If it is empty, K8s will automatically assign it randomly between [30000~32767] by default, which may conflict with other applications. It is strongly recommended that this port be uniformly allocated and used by the administrator.
            </template>
            <i class="el-icon-question" />
          </el-tooltip>
        </template>
        <template #targetPort="{record: portModel, index: portIndex}">
          <el-form-item
            label=""
            :prop="`${prefixProp}.${portIndex}.targetPort`"
            :rules="[
              validators.consistofNumber(false),
              validators.numberBetween(1, 65535, false),
            ]"
          >
            <el-input
              v-model="portModel.targetPort"
              placeholder="1-65535 internal integer"
            />
          </el-form-item>
        </template>
        <template #protocol="{record: portModel}">
          <el-select
            v-model="portModel.protocol"
          >
            <el-option
              label="TCP"
              value="TCP"
            />
            <el-option
              v-if="showUdp"
              label="UDP"
              value="UDP"
            />
          </el-select>
        </template>
        <template #port="{record: portModel, index: portIndex}">
          <el-form-item
            label=""
            :prop="`${prefixProp}.${portIndex}.port`"
            :rules="[
              validators.consistofNumber(false),
              validators.numberBetween(1, 65535, false),
              validators.enhanceNoRedundance(exsitKeys, `${portModel.protocol}-${portModel.port}`, false),
            ]"
          >
            <el-input
              v-model="portModel.port"
              placeholder="1-65535 internal integer"
            />
          </el-form-item>
        </template>
        <template #nodePort="{record: portModel, index: portIndex}">
          <el-form-item
            label=""
            :prop="`${prefixProp}.${portIndex}.nodePort`"
            :rules="[
              validators.consistofNumber(false),
              validators.numberBetween(30000, 32767, false),
            ]"
          >
            <el-input
              v-model="portModel.nodePort"
              placeholder="30000-32767, default random"
            />
          </el-form-item>
        </template>
        <template #name="{record: portModel, index: portIndex}">
          <el-form-item
            label=""
            :prop="`${prefixProp}.${portIndex}.name`"
            :rules="[
              validators.consistoLetterNumbersUnderscores(false),
              validators.endsWithLowercaseLetterOrNumber(false),
              validators.noRedundance(exsitNames, false),
              validators.lengthBetween(1, 63, false),
            ]"
          >
            <el-input
              v-model="portModel.name"
              placeholder="1-63 lowercase letters, numbers or underscores, beginning and ending with letters and numbers"
            />
          </el-form-item>
        </template>
      </dynamicBlock>
      <el-alert
        v-if="isEdit"
        title="Modifying the Ports name will cause the corresponding external service port to become invalid, and the corresponding external service port needs to be reset."
        type="info"
        show-icon
        :closable="false"
        style="line-height: 22px;margin-top:4px"
      />
    </el-form-item>
  </div>
</template>
<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    inject: [ 'elForm' ],
    props: {
        name: {
            type: String,
            default: 'PortsInput',
        },
        isEdit: {
            type: Boolean,
            default: false,
        },
        isNodePort: Boolean,
        showUdp: {
            type: Boolean,
            default: true,
        },
        required: {
            type: Boolean,
            default: false,
        },
        prefixProp: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            validators,
        };
    },
    computed: {
        exsitKeys() {
            return this.model.map(item => item.protocol + '-' + item.port);
        },
        exsitNames() {
            return this.model.map(item => item.name);
        },
    },
    watch: {
        // model: {
        //     handler(val) {
        //         this.$nextTick(() => {
        //           this.elForm.validateField(this.prefixProp);
        //         });
        //     },
        //     deep: true,
        // },
        required() {
            this.$nextTick(() => {
                this.elForm.validateField(this.prefixProp);
            });
        },
    },
    mounted() {
        this.$watch('model', {
            handler(val) {
                this.$nextTick(() => {
                    this.elForm.validateField(this.prefixProp);
                });
            },
            deep: true,
        });
    },
    methods: {
        getRandomString(length = 1) {
            let tmp = CHARS[ Math.floor(Math.random() * (CHARS.length - 10)) ];
            if (length < 1) {
                length = 1;
            }

            for (let i = 0; i < length - 1; i++) {
                const char = CHARS[Math.floor(Math.random() * CHARS.length)];
                tmp += char;
            }
            return tmp;
        },
        getDataTemplate() {
            return {
                targetPort: '',
                port: '',
                protocol: 'TCP',
                nodePort: '',
                name: this.getRandomString(6),
            };
        },
    },
};
</script>

<style module>
.wrapFromItem:global(.is-error .el-input__inner) {
  border-color: #e5e5e5;
}
.wrapFromItem:global(.is-error .el-input__inner:focus) {
  border-color: #467AFA;
}
</style>
