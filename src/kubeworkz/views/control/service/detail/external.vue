<template>
  <div>
    <div>
      <el-alert
        description="Services can be exposed to applications outside the container cloud through the load balancing controller. To enable external access, you need to specify the port exposed from the load balancing controller. Ports 80 and 443 cannot be used. The <protocol, port> combination cannot be repeated. , the port cannot be occupied by other services. It can be accessed through the IP:port of the load balancing controller. The load balancing controller has multiple instances and can be associated through DNS to achieve high availability. Changing the service port name will cause the port settings to become invalid."
        type="warning"
        show-icon
        :closable="false"
      />
      <div style="margin-top: 12px">
        <el-button
          type="primary"
          @click="$refs.externalDialog.open()"
        >
          Set up
        </el-button>
        <x-request
          ref="request"
          :class="[$style.textWrap]"
          :service="externalService"
          :params="requestParam"
          :processor="resolverAddress"
        >
          <template slot-scope="{ data }">
            <span :title="(data || []).join(',')">
              Address: {{ (data || []).join(',') }}
            </span>
          </template>
        </x-request>
      </div>
    </div>
    <x-request
      ref="request"
      style="margin-top: 12px"
      :service="externalAddressService"
      :params="requestParam"
      :processor="resolver"
    >
      <template slot-scope="{ data, loading }">
        <el-table
          v-loading="loading"
          :data="data || []"
          style="width: 100%"
        >
          <el-table-column
            prop="ex"
            label="External service port"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="{ row }">
              {{ row.ex || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="protocol"
            label="Type"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="servicePort"
            label="Service port"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            prop="servicePortName"
            label="Service port name"
            :show-overflow-tooltip="true"
          />
        </el-table>
      </template>
    </x-request>
    <external-dialog
      ref="externalDialog"
      :instance="instance"
      @refresh="refresh"
    />
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import extendWorkloadService from 'kubeworkz/services/k8s-extend-resource';
import externalDialog from './external-dialog.vue';

export default {
    components: {
        externalDialog,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            externalService: extendWorkloadService.getExternalAddress,
            externalAddressService: extendWorkloadService.getExternalAddressInService,
            columns: [
                { title: 'External service port', name: 'ex' },
                { title: 'Type', name: 'protocol' },
                { title: 'Service port', name: 'servicePort' },
            ],
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
        resolverAddress(response) {
            return response || [];
        },
        resolver(response) {
            return (response || []).map(t => ({
                ...t,
                ex: getFunc(t, 'externalPort'),
            }));
        },
        refresh() {
            this.$refs.request.request();
        },
    },
};
</script>

<style module>
.wrap[error] {
    color: $brand-error;
}
.textWrap {
    display: inline-block;
    margin-left: 100px;
    max-width: 500px;
    vertical-align: middle;
    overflow: hidden;
    word-wrap: normal;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>
