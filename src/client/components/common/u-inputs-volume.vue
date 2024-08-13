<template>
  <u-form-table
    ref="formTable"
    :dynamic="dynamic"
    @add="add"
    @change="onChange"
    @validate="valid = $event.valid"
  >
    <thead>
      <tr>
        <th width="180px">
          Mount directory
        </th>
        <th width="110px">
          Type
        </th>
        <th width="250px">
          Parameter
        </th>
      </tr>
    </thead>
    <tbody>
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
            v-model="item.mountPath"
            size="huge"
            name="mountPath"
            :disabled="disabled"
            placeholder="Composed of letters, numbers, dashes, underlines, periods or &quot;/&quot;, starting with &quot;/&quot; and ending with &quot;/&quot;"
            @change="changeName($event, index)"
          />
        </td>
        <td>
          <u-select
            v-model="item.type"
            :data="types"
            size="huge normal"
            :disabled="disabled"
            @select="onSelectType($event, index)"
          />
        </td>
        <td v-if="item.type === 'hostPath'">
          <u-linear-layout gap="small">
            <u-input
              v-model="item.name"
              size="huge"
              style="width: 120px"
              name="hostPath"
              :disabled="disabled"
              placeholder="path"
            />
            <u-select
              v-model="item.pathType"
              size="huge"
              style="width: 109px;"
              :data="pathTypes"
              :disabled="disabled"
            />
          </u-linear-layout>
        </td>
        <td v-show="item.type === 'emptyDir'">
          <u-linear-layout gap="small">
            <u-select
              key="emptyDir"
              v-model="item.name"
              size="huge"
              style="width: 110px;"
              :data="currentEmptyDirs"
            />
            <u-select
              key="emptyDirRead"
              v-model="item.readOnly"
              size="huge"
              style="width: 110px;"
              :data="readOnlyList"
            />
          </u-linear-layout>
        </td>
        <td v-show="item.type === 'pvc'">
          <u-select
            v-if="pvcNames.length"
            key="listPVC"
            v-model="item.name"
            size="huge"
            :data="pvcNames"
          />
          <u-select
            v-else
            key="nonePVC"
            disabled
            size="huge"
            :data="emptyPVCNames"
          />
        </td>
        <td v-show="item.type === 'secret'">
          <u-select
            v-if="secretNames.length"
            key="listSecret"
            v-model="item.name"
            size="huge"
            :data="secretNames"
          />
          <u-select
            v-else
            key="noneSecret"
            disabled
            size="huge"
            :data="emptySecretNames"
          />
        </td>
        <td v-show="item.type === 'configMap'">
          <u-select
            v-if="configMapNames.length"
            key="listConfigMap"
            v-model="item.name"
            size="huge"
            :data="configMapNames"
          />
          <u-select
            v-else
            key="noneConfigMap"
            disabled
            size="huge"
            :data="emptyConfigMapNames"
          />
        </td>
        <td v-show="item.type === 'volumeClaimTemplate'">
          <u-select
            key="listTemplate"
            v-model="item.name"
            size="huge"
            :data="templates"
            :disabled="disabled"
          />
        </td>
      </tr>
    </tbody>
  </u-form-table>
</template>

<script>
import { Inputs } from '@micro-app/common/base/mixins';
const TYPES = [
    { text: 'PVC', value: 'pvc' },
    { text: 'HostPath', value: 'hostPath' },
    { text: 'EmptyDir', value: 'emptyDir' },
    { text: 'Secret', value: 'secret' },
    { text: 'ConfigMap', value: 'configMap' },
    { text: 'Store template', value: 'volumeClaimTemplate' },
];
const PATH_TYPES = [ 'DirectoryOrCreate', 'FileOrCreate' ];

export default {
    name: 'UInputsVolume',
    mixins: [ Inputs ],
    props: {
        disabled: { type: Boolean, default: false },
        secrets: { type: Array, default: () => ([]) },
        pvcNames: { type: Array, default: () => ([]) },
        configMaps: { type: Array, default: () => ([]) },
        emptyDirs: { type: Array, default: () => ([]) },
        templates: { type: Array, default: () => ([]) },
        type: { type: String },
        isCreate: { type: Boolean, default: false },
        showVolumeClaimTemplates: { type: Boolean, default: false },
        showEmptyDir: { type: Boolean, default: true },
    },
    data() {
        return {
            dynamic: !this.disabled,
            emptySecretNames: [{ text: 'No Secret yet' }],
            emptyConfigMapNames: [{ text: 'No ConfigMap yet' }],
            emptyPVCNames: [{ text: 'No PVC yet' }],
            pathTypes: PATH_TYPES.map(item => ({ text: item, value: item })),
            currentEmptyDirs: this.getEmptyDirList(this.emptyDirs),
            readOnlyList: [
                { text: 'Read and write', value: false },
                { text: 'Read only', value: true },
            ],
            rules: {
                mountPath: [
                    { type: 'string', pattern: /^\//, trigger: 'input+blur', message: 'To ... beginning' },
                    { type: 'string', pattern: /^\/[\w\-\.\/]*$/, trigger: 'input+blur', message: 'Composed of letters, numbers, dashes, underlines, English periods or "/"' },
                    { type: 'string', message: 'Must not contain consecutive "/"', trigger: 'input+blur', validator: (rule, value, callback) => ((value.indexOf('//') === -1) ? callback() : callback(new Error())) },
                    { type: 'string', trigger: 'input+blur', message: 'The mount directory already exists', validator: (rule, value, callback) => {
                        const mountPathList = this.sortList.map(item => this.getMountPath(item.mountPath));
                        (mountPathList.filter(item => item === this.getMountPath(value)).length > 1) ? callback(new Error()) : callback();
                    } },
                ],
                hostPath: [
                    { type: 'string', pattern: /^\//, trigger: 'input+blur', message: 'To ... beginning' },
                    { type: 'string', pattern: /^\/[\w\-\.\/]*$/, trigger: 'input+blur', message: 'Composed of letters, numbers, dashes, underlines, English periods or "/"' },
                    { type: 'string', message: 'Must not contain consecutive "/"', trigger: 'input+blur', validator: (rule, value, callback) => ((value.indexOf('//') === -1) ? callback() : callback(new Error())) },
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
        // Take the first item in the list as the default value when the user switches types
        pvcName() {
            return ((this.pvcNames || [])[0] || {}).value;
        },
        secretName() {
            return ((this.secretNames || [])[0] || {}).value;
        },
        configMapName() {
            return ((this.configMapNames || [])[0] || {}).value;
        },
        volumeClaimTemplateName() {
            return ((this.templates || [])[0] || {}).value;
        },
        emptyDirName() {
            return ((this.currentEmptyDirs || [])[0] || {}).value;
        },
        types() {
            let res = this.showVolumeClaimTemplates ? TYPES.slice(1) : TYPES.slice(0, -1);

            if (!this.showEmptyDir) { res = res.filter(item => item.value !== 'emptyDir'); }

            return res;
        },

    },
    watch: {
        showVolumeClaimTemplates(value) {
            this.isCreate && this.sortList.forEach((item, index) => {
                const _item = value ? Object.assign(item, {
                    type: 'hostPath', name: '', pathType: 'DirectoryOrCreate',
                }) : Object.assign(item, {
                    type: 'pvc', name: this.pvcName,
                });
                this.sortList.splice(index, 1, _item);
            });
        },
        emptyDirs(value) {
            if (value && value.length) {
                this.currentEmptyDirs = this.getEmptyDirList(value);
                this.sortList.forEach(item => {
                    // If the modified emptyDirs does not contain an item of type emptyDir in the existing mounted data volume. then reset it
                    if (item.type === 'emptyDir' && !value.some(emptyDir => emptyDir.name === item.name)) { item.name = ''; }
                });
            }
        },
        list: {
            handler(val) {
                this.sortList = this.normalize(val);
            },
            deep: true,
        },
    },
    methods: {
        getDefault() {
            return {
                mountPath: '',
                name: this.showVolumeClaimTemplates ? '' : this.pvcName,
                type: this.showVolumeClaimTemplates ? 'hostPath' : 'pvc',
                pathType: this.showVolumeClaimTemplates ? 'DirectoryOrCreate' : '',
                readOnly: false, // Default read and write
            };
        },
        normalize(list) {
            return list.map(item => {
                const { mountPath, type, name, hostPath } = item;
                if (type === 'hostPath') {
                    return {
                        type,
                        mountPath,
                        name: hostPath.path, // The name of hostpath is path
                        pathType: hostPath.type,
                        volumeName: item.volumeName,
                    };
                } else if (type === 'emptyDir') {
                    return {
                        name,
                        type,
                        mountPath,
                        readOnly: _.get(item, 'emptyDir.readOnly', false),
                    };
                } return item;
            });
        },
        $getData(list) {
            return this.getLegalList(list || this.sortList)
                .filter(item => item.mountPath && (item.type === 'hostPath' ? item.name : true) && (item.type === 'emptyDir' ? item.name : true))
                .map(item => {
                    const { mountPath, type, name, pathType, readOnly } = item;
                    if (type === 'hostPath') {
                        return {
                            type,
                            mountPath,
                            hostPath: {
                                path: name,
                                type: pathType,
                            },
                        };
                    } else if (type === 'emptyDir') {
                        const emptyDir = this.emptyDirs.find(item => item.value === name);
                        return {
                            type,
                            mountPath,
                            name: emptyDir.value,
                            emptyDir: Object.assign({}, _.pick(emptyDir, [ 'medium', 'sizeLimit' ]), { readOnly }),
                        };
                    } return { mountPath, type, name };
                });
        },
        // Assign name to the value under the corresponding type
        onSelectType(event, index) {
            const type = event.value || 'hostPath';
            this.sortList[index].name = type === 'hostPath' ? '' : this[type + 'Name'];
            this.sortList[index].pathType = type === 'hostPath' ? 'DirectoryOrCreate' : '';
        },
        getMountPath(path = '') {
            return path.endsWith('/') ? path.slice(0, -1) : path;
        },
        getEmptyDirList(list = []) {
            return [{ text: 'Please choose', value: '' }].concat(list);
        },
        changeName(event, index) {
            this.sortList[index].name = this.sortList[index].type === 'hostPath' ? '' : this.sortList[index].name || this[this.sortList[index].type + 'Name'];
            this.sortList[index].pathType = this.sortList[index].type === 'hostPath' ? 'DirectoryOrCreate' : '';
        },
    },
};
</script>
