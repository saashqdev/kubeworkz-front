<template>
  <el-dialog
    :title="isEdit ? 'Edit storage statement' : 'Create a storage claim'"
    :visible.sync="show"
    width="800px"
    @close="close"
    ok-button=""
    cancel-button=""
    :close-on-click-modal="false"
  >
    <x-request
      v-if="show"
      ref="request"
      :service="storageService"
      :params="params"
      :processor="storageResolver"
    >
      <template slot-scope="{ data, loading }">
          <i v-if="loading" class="el-icon-loading" style="font-size: 24px"/>
          <el-form
            v-else
            :model="model"
            ref="form"
            label-width="120px"
          >
            <el-form-item
              label="Storage class"
              :rules="[
                validators.required(),
              ]"
              prop="spec.storageClassName"
            >
              <el-select
                v-if="(data || []).length"
                v-model="model.spec.storageClassName" 
                filterable
                placeholder="Select storage class"
                :disabled="isEdit"
              >
                <el-option
                  v-for="item in data"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                  :title="item.text"
                />
              </el-select>
              <el-input
                v-else
                disabled
                placeholder="No storage class yet"
              />
            </el-form-item>
            <el-form-item
              label="Name"
              :rules="[
                validators.required(),
                validators.k8sResourceNameValidator()
              ]"
              prop="metadata.name"
            >
              <el-input v-model="model.metadata.name" :disabled="isEdit" placeholder="1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number"/>
            </el-form-item>
            <el-form-item 
              label="Capacity"
              :rules="[
                validators.required(),
                validators.consistofFloatNumber(false),
                validators.numberBiggerThen(0, false)
              ]"
              prop="spec.storage"
            >
              <el-input
                v-model="model.spec.storage"
              >
                <template slot="append">GiB</template>
              </el-input>
            </el-form-item>
            <el-form-item
              label="Model"
              :rules="[
                validators.required(),
              ]"
              prop="spec.accessMode"
            >
              <template slot="label">
                Model
                <el-tooltip effect="dark" placement="bottom-start" popper-class="ncs-el-tooltip-popper">
                  <template slot="content">
                    Depending on the storage provider, select the supported access mode. For specific rules, refer to
                    <el-link type="primary" @click="handleJump('https://kubernetes.io/en-us/docs/concepts/storage/persistent-volumes/#access-modes')">link</el-link>
                  </template>
                  <i class="el-icon-question" style="position: absolute;right:4px;top:11px"/>
                </el-tooltip>
              </template>
              <el-select
                v-model="model.spec.accessMode"
                :disabled="isEdit"
              >
                <el-option
                  v-for="item in getModes(data)"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                  :title="item.text"
                />
              </el-select>
            </el-form-item>
          </el-form>
      </template>
    </x-request>
    <div slot="footer">
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" @click="submit" :loading="commitLoading">OK</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { get as getFunc, cloneDeep } from 'lodash';
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import workloadService from 'kubeworkz/services/k8s-resource';
import {
    toPlainObject as toStorageClassPlainObject,
} from 'kubeworkz/k8s-resources/storageclass';
import {
    toPlainObject as toPVCPlainObject,
    toK8SObject as toPVCK8SObject,
} from 'kubeworkz/k8s-resources/persistentvolumeclaim';
import {
    PVC_MODE_TEXT_MAP,
} from 'kubeworkz';
import {
    setValueIfListNotPresent,
} from 'kubeworkz/utils/functional';
import * as validators from 'kubeworkz/utils/validators';

const modes = Object.keys(PVC_MODE_TEXT_MAP).map(key => ({
    text: PVC_MODE_TEXT_MAP[key],
    value: key,
}));
export default {
    mixins: [ Modal ],
    data() {
        return {
            validators,
            storageService: workloadService.getStorage,
            model: toPVCPlainObject(),
            isEdit: false,
            initStorage: 0,
            commitLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        params() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    resource: 'storageclasses',
                },
            };
        },
    },
    methods: {
        handleJump(url) {
            window.open(url);
        },
        async open(item) {
            if (item) {
                this.isEdit = true;
                const response = await workloadService.getAPIV1Instance({
                    pathParams: {
                        cluster: this.cluster,
                        namespace: this.namespace,
                        resource: 'persistentvolumeclaims',
                        name: item.metadata.name,
                    },
                });
                this.model = toPVCPlainObject(response);
            } else {
                this.model = toPVCPlainObject();
            }
            this.show = true;
        },
        storageResolver(response) {
            const items = (response.items || []).map(toStorageClassPlainObject).map(t => ({
                text: t.metadata.name,
                value: t.metadata.name,
                ...t,
            }));
            setValueIfListNotPresent({
                list: items,
                path: 'value',
                current: getFunc(this.model, 'spec.storageClassName'),
            }, val => {
                this.model.spec.storageClassName = getFunc(val, 'value');
            });
            return items;
        },
        getModes(storageClassNames) {
            if (storageClassNames.length === 0 || !this.model.spec.storageClassName) return [];
            const curr = storageClassNames.find(sc => sc.value === this.model.spec.storageClassName);
            return curr.provisioner === 'ceph.com/rbd' ? modes.slice(0, 2) : modes;
        },
        async submit() {
            // Trigger verification
            try {
                if (this.$refs) {
                    await this.$refs.form.validate();
                } else {
                    return;
                }
            } catch (error) {
                return;
            }
            this.commitLoading = true;
            try {
                if (this.isEdit) {
                    const yaml = cloneDeep(this.model.puresource);
                    yaml.spec.resources.requests.storage = `${this.model.spec.storage}Gi`
                    await workloadService.modifyAPIV1Instance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'persistentvolumeclaims',
                            name: this.model.metadata.name,
                        },
                        data: yaml,
                    });
                } else {
                    const yaml = toPVCK8SObject(this.model);
                    await workloadService.createAPIV1Instance({
                        pathParams: {
                            cluster: this.cluster,
                            namespace: this.namespace,
                            resource: 'persistentvolumeclaims',
                        },
                        data: yaml,
                    });
                }
                this.$emit('refresh');
                this.close();
            } catch (error) {
                console.log(error);
            }
            this.commitLoading = false;
        },
    },
};
</script>

<style>

</style>
