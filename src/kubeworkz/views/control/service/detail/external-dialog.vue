<template>
  <div>
    <el-dialog
      title="External access settings"
      :visible.sync="show"
      width="640px"
      :close-on-click-modal="false"
      @close="close"
    >
      <el-form
        ref="form"
        :model="data"
      >
        <i
          v-if="loading"
          class="el-icon-loading"
          style="font-size: 24px"
        />
        <el-form-item v-else>
          <dynamicBlock
            v-model="data"
            :get-default-item="getDataTemplate"
            :show-delete-btn="false"
            :show-add-btn="false"
            :columns="[
              {
                title: 'Service port',
                dataIndex: 'servicePort',
              },
              {
                title: 'Protocol',
                dataIndex: 'protocol',
              },
              {
                title: 'External service port',
                dataIndex: 'ex',
                width: '250px'
              },
              {
                title: 'Service port name',
                dataIndex: 'servicePortName',
              },
            ]"
          >
            <template #ex="{record: dataModel, index: dataIndex}">
              <div style="display:flex;align-items:center">
                <el-switch
                  v-model="dataModel.enable"
                  style="margin-right:8px"
                  @change="dataModel.ex = ''"
                />
                <el-form-item
                  label=""
                  :prop="`${dataIndex}.ex`"
                  :rules="[
                    validators.consistofNumber(false),
                    validators.numberBetween(1, 65535, false),
                  ]"
                >
                  <el-input
                    v-model="dataModel.ex"
                    placeholder="1-65535 internal integer"
                    :disabled="!dataModel.enable"
                  />
                </el-form-item>
              </div>
            </template>
          </dynamicBlock>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="close">
          Cancel
        </el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="submit"
        >
          OK
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import { Modal } from '@micro-app/common/mixins';
import extendWorkloadService from 'kubeworkz/services/k8s-extend-resource';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ Modal ],
    props: {
        instance: Object,
    },
    data() {
        return {
            validators,
            data: [],
            loading: false,
            submitLoading: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        workload() {
            return this.$route.params.workload;
        },
        requestParam() {
            return {
                pathParams: {
                    cluster: this.cluster,
                    namespace: this.namespace,
                    name: this.instance.metadata.name,
                },
            };
        },
    },
    methods: {
        open() {
            this.loadExternals();
            this.show = true;
        },
        async loadExternals() {
            this.loading = true;
            const response = await extendWorkloadService.getExternalAddressInService(this.requestParam);
            this.data = this.resolver(response);
            this.loading = false;
        },
        resolver(response) {
            return (response || []).map(i => ({
                ...i,
                ex: getFunc(i, 'externalPort', ''),
                enable: !!i.externalPort,
            }));
        },
        getDataTemplate() {
            return {};
        },
        async submit() {
            try {
                await this.$refs.form.validate();
            } catch (error) {
                console.log(error);
                return;
            }
            this.submitLoading = true;
            try {
                const data = this.data.map(i => (i.enable ? {
                    protocol: i.protocol,
                    servicePort: i.servicePort,
                    externalPort: parseInt(i.ex),
                } : {
                    protocol: i.protocol,
                    servicePort: i.servicePort,
                }));
                await extendWorkloadService.setExternalAddressInService({
                    ...this.requestParam,
                    data,
                });
                this.$emit('refresh');
                this.close();
            } catch (error) {
                console.log(error);
            }
            this.submitLoading = false;
        },
    },
};
</script>

<style module>
.formItem[class] {
    margin-bottom: 30px !important;
}
</style>
