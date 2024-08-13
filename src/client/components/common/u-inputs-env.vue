<template>
  <u-form-table
    ref="formTable"
    :dynamic="true"
    @add="add"
    @change="onChange"
    @validate="valid = $event.valid"
  >
    <thead>
      <tr>
        <th width="169px">
          Key
        </th>
        <th width="110px">
          Value type
        </th>
        <th width="261px">
          Value
        </th>
      </tr>
    </thead>
    <tbody>
      <!-- Currently only supports type 'value' -->
      <tr
        is="u-form-table-tr"
        v-for="item in sortExtraList"
        :key="item.name"
        disabled
        ignore
      >
        <td>
          <u-input
            disabled
            size="huge"
            :value="item.name"
          />
        </td>
        <td>
          <u-select
            disabled
            size="huge"
            :value="item.type"
            :data="types"
          />
        </td>
        <!-- The env key-value pairs added by the system currently only support: string, field, resource -->
        <td v-show="item.type === 'string'">
          <u-input
            disabled
            size="huge"
            :value="item.value"
            placeholder="0-2048 ASCII characters"
          />
        </td>
        <td v-show="item.type === 'field'">
          <u-select-with-empty
            v-model="item.fieldPath"
            disabled
            :data="fields"
            size="huge full"
          />
        </td>
        <td v-show="item.type === 'resource'">
          <u-linear-layout gap="small">
            <u-select-with-empty
              v-model="item.containerName"
              disabled
              :data="containerNames"
              size="huge small"
            />
            <u-select-with-empty
              v-model="item.resource"
              disabled
              :data="resources"
              size="huge small"
            />
          </u-linear-layout>
        </td>
      </tr>

      <tr
        is="u-form-table-tr"
        v-for="(item, index) in sortList"
        :key="index"
        :rules="rules"
        :can-be-empty="canBeEmpty"
        :is-empty="isEmpty.bind(this)"
        @remove="remove(index)"
      >
        <td>
          <u-input
            ref="input"
            v-model="item.name"
            size="huge"
            name="name"
            placeholder="Composed of 1-64 letters, numbers or underscores, starting with a letter"
            title="Composed of 1-64 letters, numbers or underscores, starting with a letter"
          />
        </td>
        <td>
          <u-select
            v-model="item.type"
            size="huge"
            :data="types"
          />
        </td>
        <td v-show="item.type === 'string'">
          <u-input
            v-model="item.value"
            size="huge full"
            name="value"
            placeholder="0-2048 ASCII characters"
            title="0-2048 ASCII characters"
          />
        </td>
        <td v-show="item.type === 'secret'">
          <u-linear-layout gap="small">
            <u-select
              v-if="secretNames.length"
              key="listName"
              v-model="item.secretName"
              size="huge small"
              :data="secretNames"
              @select="onSelectSecretName($event, index)"
            />
            <u-select
              v-else
              key="noneName"
              size="huge small"
              :data="[{ text: 'No secret yet' }]"
              disabled
            />
            <u-select
              v-if="item.secretKeys.length"
              key="listKey"
              v-model="item.secretKey"
              size="huge small"
              :data="item.secretKeys"
            />
            <u-select
              v-else
              key="noneKey"
              size="huge small"
              :data="[{ text: 'No secret key yet'}]"
              disabled
            />
          </u-linear-layout>
        </td>
        <td v-show="item.type === 'configMap'">
          <u-linear-layout gap="small">
            <u-select
              v-if="configMapNames.length"
              key="listConfigMapName"
              v-model="item.configMapName"
              size="huge small"
              :data="configMapNames"
              @select="onSelectConfigMapName($event, index)"
            />
            <u-select
              v-else
              key="noneConfigMapName"
              size="huge small"
              :data="[{ text: 'No configMap yet'}]"
              disabled
            />
            <u-select
              v-if="item.configMapKeys.length"
              key="listConfigMapKey"
              v-model="item.configMapKey"
              size="huge small"
              :data="item.configMapKeys"
            />
            <u-select
              v-else
              key="noneConfigMapKey"
              size="huge small"
              :data="[{ text: 'No configMap key yet'}]"
              disabled
            />
          </u-linear-layout>
        </td>
        <td v-show="item.type === 'field'">
          <u-select-with-empty
            v-model="item.fieldPath"
            :data="fields"
            size="huge full"
          />
        </td>
        <td v-show="item.type === 'resource'">
          <u-linear-layout gap="small">
            <u-select-with-empty
              v-model="item.containerName"
              :data="containerNames"
              :need-default="true"
              size="huge small"
            />
            <u-select-with-empty
              v-model="item.resource"
              :data="resources"
              size="huge small"
            />
          </u-linear-layout>
        </td>
      </tr>
    </tbody>
  </u-form-table>
</template>

<script>
import { Inputs } from '@micro-app/common/base/mixins';
import { at, get } from 'lodash';
const FIELD_DATA = [
    'metadata.name',
    'metadata.namespace',
    'metadata.uid',
    'spec.nodeName',
    'spec.serviceAccountName',
    'status.hostIP',
    'status.podIP',
];

const RESOURCE_DATA = [
    'requests.ephemeral-storage',
    'requests.memory',
    'requests.cpu',
    'limits.ephemeral-storage',
    'limits.memory',
    'limits.cpu',
];
// enhance: valueFrom attribute
export default {
    name: 'UInputsEnv',
    mixins: [ Inputs ],
    props: {
        type: { type: String },
        secrets: { type: Array, default: () => ([]) },
        configMaps: { type: Array, default: () => ([]) },
        containerNames: { type: Array, default: () => ([]) },
        extraList: { type: Array, default: () => ([]) },
    },
    data() {
        return {
            sortExtraList: [],
            fields: FIELD_DATA,
            resources: RESOURCE_DATA,
            rules: {
                name: [
                    { type: 'string', pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/, trigger: 'input+blur', message: 'Key consists of 1-64 letters, numbers, or underscores, starting with a letter' },
                    { type: 'string', trigger: 'input+blur', message: 'Cannot use system reserved environment variables', validator: (rule, value, callback) => {
                        return value.startsWith('SKIFF_') ? callback(new Error()) : callback();
                    } },
                    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => (this.sortList.some(item => {
                        const isError = item.type === 'string' ? !!(item.name === value && !value && item.value) : !!(item.name === value && !value && item.secretKey && item.secretName);
                        return !!isError;
                    }) ? callback(new Error()) : callback()) },
                    { type: 'string', trigger: 'blur', message: 'Key cannot be empty', validator: (rule, value, callback) => (this.sortList.some(item => {
                        const isError = item.type === 'string' ? (item.name === value && !value && item.value) : (item.name === value && !value && item.secretKey && item.secretName);
                        return !!isError;
                    }) ? callback(new Error()) : callback()) },
                ],
                value: [
                    // eslint-disable-next-line
                    { type: 'string', pattern: /^[\u0000-\u007F]{0,2048}$/, trigger: 'input+blur', message: 'Value must consist of 0-2048 ASCII characters' },
                ],
            },
        };
    },
    computed: {
        secretNames() {
            return this.secrets.map(item => ({ text: item.name, value: item.name }));
        },
        configMapNames() {
            return this.configMaps.map(item => ({ text: item.name, value: item.name }));
        },
        defaultSecretKeys() {
            return this.getKeys('', 'secrets');
        },
        defaultConfigMapKeys() {
            return this.getKeys('', 'configMaps');
        },
        types() {
            if (!this.type) {
                return [
                    { value: 'string', text: 'Value' },
                    { value: 'secret', text: 'Secret' },
                    { value: 'configMap', text: 'ConfigMap' },
                    { value: 'field', text: 'Field' },
                    { value: 'resource', text: 'Resource' },
                ];
            } else if (this.type === 'cicd') {
                return [{ value: 'string', text: '值' }];
            }
        },
    },
    watch: {
        containerNames(value) {
            // Because the container name can be changed at any time. If the changed container name list does not have a current item, its value will be reset.
            this.sortList.forEach(item => {
                if (value && item.containerName && !value.includes(item.containerName)) { item.containerName = ''; }
            });
        },
        secrets: {
            handler(value) {
                if (value.length) {
                    this.sortList.forEach((item, index) => {
                        item.secretKeys = item.secretName ? this.getKeys(item.secretName, 'secrets') : this.defaultSecretKeys;
                        item.secretKey = item.secretKey || ((item.secretKeys && item.secretKeys[0]) || {}).value;
                        item.secretName = item.secretName || ((this.secretNames && this.secretNames[0]) || {}).value,
                        this.sortList.splice(index, 1, item);
                    });
                }
            },
            deep: true,
        },
        configMaps: {
            handler(value) {
                if (value.length) {
                    this.sortList.forEach((item, index) => {
                        item.configMapKeys = item.configMapName ? this.getKeys(item.configMapName, 'configMaps') : this.defaultConfigMapKeys;
                        item.configMapKey = item.configMapKey || ((item.configMapKeys && item.configMapKeys[0]) || {}).value;
                        item.configMapName = item.configMapName || ((this.configMapNames && this.configMapNames[0]) || {}).value;
                        this.sortList.splice(index, 1, item);
                    });
                }
            },
            deep: true,
        },
    },
    created() {
        // This.normalize cannot be called within the data() function because the type has not been initialized at this time. If there is corresponding data of valueFrom in extraList, an error will be reported.
        this.sortExtraList = this.normalize(this.extraList);
    },
    methods: {
        getDefault() {
            return {
                name: '',
                value: '',
                type: 'string',
                secretName: ((this.secretNames && this.secretNames[0]) || {}).value,
                secretKeys: this.defaultSecretKeys,
                secretKey: ((this.defaultSecretKeys && this.defaultSecretKeys[0]) || {}).value,
                configMapName: ((this.configMapNames && this.configMapNames[0]) || {}).value,
                configMapKeys: this.defaultConfigMapKeys,
                configMapKey: ((this.defaultConfigMapKeys && this.defaultConfigMapKeys[0]) || {}).value,
                fieldPath: FIELD_DATA[0],
                containerName: '',
                resource: RESOURCE_DATA[0],
            };
        },
        getKeys(name, key = 'secrets') {
            const arr = this[key] || [];
            if (!arr.length) { return []; }

            const index = arr.findIndex(item => item.name === name);
            const keys = Object.keys(arr[index < 0 ? 0 : index].data);
            return keys.map(item => ({ text: item, value: item }));
        },
        normalize(list) {
            const getType = (item = {}) => {
                let tmp = '';
                const { valueFrom } = item;

                if (!valueFrom) { return 'string'; }

                Object.keys(item.valueFrom).some(key => {
                    const type = this.types.find(item => key.startsWith(item.value));
                    if (type) {
                        tmp = type.value;
                        return true;
                    } return false;
                });
                return tmp;
            };

            return list.map(item => {
                const [ secretKey, secretName ] = at(item, [ 'valueFrom.secretKeyRef.key', 'valueFrom.secretKeyRef.name' ]);
                const [ configMapKey, configMapName ] = at(item, [ 'valueFrom.configMapKeyRef.key', 'valueFrom.configMapKeyRef.name' ]);
                const fieldPath = get(item, 'valueFrom.fieldRef.fieldPath', '');
                const resourceFieldRef = get(item, 'valueFrom.resourceFieldRef');
                const secretKeys = secretName ? this.getKeys(secretName, 'secrets') : this.defaultSecretKeys;
                const configMapKeys = configMapName ? this.getKeys(configMapName, 'configMaps') : this.defaultConfigMapKeys;
                return {
                    name: item.name,
                    value: item.value || '',
                    type: getType(item),
                    secretName: secretName || ((this.secretNames && this.secretNames[0]) || {}).value,
                    secretKeys,
                    secretKey: secretKey || ((secretKeys && secretKeys[0]) || {}).value,
                    configMapName: configMapName || ((this.configMapNames && this.configMapNames[0]) || {}).value,
                    configMapKeys,
                    configMapKey: configMapKey || ((configMapKeys && configMapKeys[0]) || {}).value,
                    fieldPath,
                    containerName: resourceFieldRef && this.containerNames.includes(resourceFieldRef.containerName) ? resourceFieldRef.containerName : '',
                    resource: resourceFieldRef ? resourceFieldRef.resource : '',
                };
            });
        },
        onSelectSecretName(event, index) {
            const keys = this.getKeys(event.value, 'secrets');
            Object.assign(this.sortList[index], {
                secretKeys: keys,
                secretKey: keys.length ? keys[0].value : undefined,
            });
            this.$refs.input && this.$refs.input[0].blur();
        },
        onSelectConfigMapName(event, index) {
            const keys = this.getKeys(event.value, 'configMaps');
            Object.assign(this.sortList[index], {
                configMapKeys: keys,
                configMapKey: keys.length ? keys[0].value : undefined,
            });
            this.$refs.input && this.$refs.input[0].blur();
        },
        getFormData(item = {}) {
            const { type, fieldPath, containerName, resource } = item;
            if ([ 'secret', 'configMap' ].includes(type)) {
                return {
                    [`${type}KeyRef`]: {
                        name: item[`${type}Name`],
                        key: item[`${type}Key`],
                    },
                };
            } else if (type === 'field') {
                return {
                    fieldRef: { fieldPath },
                };
            } else if (type === 'resource') {
                return {
                    resourceFieldRef: { containerName, resource },
                };
            } return {};
        },
        $getData(list) {
            const tmp = this.getLegalList(list || this.sortList).concat(this.sortExtraList);
            // When the type is resource, the corresponding containerName must be selected.
            return tmp.filter(item => item.name && (item.type === 'resource' ? item.containerName : true))
                .map(item => {
                    return item.type === 'string' ?
                        { name: item.name, value: item.value } :
                        { name: item.name, valueFrom: this.getFormData(item) };
                });
        },
    },
};
</script>
