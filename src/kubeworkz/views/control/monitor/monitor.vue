<template>
  <div>
    <!-- <u-info-list-group :title="`${title} monitor`" /> -->
    <div style="margin-bottom: 20px">
      <i
        v-if="loading"
        class="el-icon-loading"
        style="font-size: 24px"
      />
      <div v-else-if="rows.length === 0">
        No monitoring items yet
      </div>
      <template v-else>
        <div style="display:flex;">
          <div style="margin-right:8px;display:flex;">
            <span style="margin-right:8px;line-height:32px">Time:</span>
            <dateCustomPicker
              :date="{ startTime, endTime}"
              @update="updateTime"
            />
          </div>
          <div
            v-if="selectshowable"
            style="margin-right:8px;display:flex;"
          >
            <span style="margin-right:8px;line-height:32px">Monitoring dimensions:</span>
            <dimensionSelect
              :value="rows"
              @change="handleAsyncPanelShow"
            />
          </div>
        </div>
        <kube-pipe
          v-if="variables.length > 0"
          ref="pipeVariables"
          :graph="pipeSeq"
          :class="$style.variableWrapper"
          @pipestatechange="pipeLoading = $event"
        >
          <div
            v-for="v in variables"
            :key="v.name"
            :class="$style.variable"
          >
            <span style="margin-right:8px;line-height:32px">{{ v.displayName }}</span>
            <kube-valve
              component="span"
              :name="v.name"
              :valve="variableSelected[v.name]"
              :request="() => resolveRequest(v)"
            >
              <template v-if="sources[v.name]">
                <template v-if="sources[v.name].length > 0">
                  <div>
                    <span :class="$style.occupation">{{ findLongest(sources[v.name]) }}</span>
                    <el-select
                      v-model="variableSelected[v.name]"
                      placeholder="Please choose"
                      style="width: 100%"
                      :class="$style.selector"
                    >
                      <el-option
                        v-for="item in sources[v.name]"
                        :key="item.value"
                        :label="item.text"
                        :value="item.value"
                      />
                    </el-select>
                  </div>
                </template>
                <el-select
                  v-else
                  value=""
                  disabled
                  style="width: auto"
                  :placeholder="`None ${v.name}`"
                />
              </template>
            </kube-valve>
          </div>
        </kube-pipe>
      </template>
    </div>
    <template v-if="!pipeLoading && startTime && endTime">
      <template v-for="row in rows">
        <div
          v-if="selectshowable ? row.panels.find(panel => panel.showPanel) : true"
          :key="row.name"
        >
          <div :class="$style.rowTitle">
            <span>{{ row.name }}</span>
          </div>
          <div :class="$style.container">
            <template v-for="panel in row.panels">
              <div
                v-if="selectshowable ? panel.showPanel : true"
                :key="panel.name"
                :is-table="panel.type === 'table'"
                :class="[$style.block, $style[`block-${panel.span}`]]"
              >
                <kube-chart
                  v-if="panel.type === 'graph'"
                  :title="panel.title"
                  :meta="panel"
                  :scope="scope"
                  :query="panel.targets.map(t => t.query({...variableSelected, ...scope}))"
                  :legend-template="panel.targets.map(t => t.legendTemplate)"
                  :start-time="startTime"
                  :end-time="endTime"
                  :is-quick-time="timeType === 'quick'"
                  :quick-time="quickValue"
                  :period-list="periodList"
                  height="270px"
                />
                <kube-data-table
                  v-if="panel.type === 'table'"
                  :query="panel.targets.map(t => ({
                                ...t,
                                query: t.query({...variableSelected, ...scope})
                  }))"
                  :scope="scope"
                  :meta="panel"
                  :start-time="startTime"
                  :end-time="endTime"
                />
                <kube-data-board
                  v-if="panel.type === 'singleStat'"
                  :query="panel.targets.map(t => ({
                                ...t,
                                query: t.query({...variableSelected, ...scope})
                  }))"
                  :meta="panel"
                  :scope="scope"
                  :start-time="startTime"
                  :end-time="endTime"
                />
              </div>
            </template>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { get as getFunc } from 'lodash';
import { get } from 'vuex-pathify';
import monitorService from 'kubeworkz/services/monitor';
import {
    toPlainObject as toMonitorPlainObject,
} from 'kubeworkz/k8s-resources/monitor/index.js';
import {
    setValueIfListNotPresent,
    getStep,
    getStepTime,
} from 'kubeworkz/utils/functional';
import kubeDataBoard from 'kubeworkz/component/common/kube-data-board/kube-data-board.vue';
import dateCustomPicker from 'kubeworkz/elComponent/date-custom-picker.vue';
import dimensionSelect from './dimensionSelect.vue';
export default {
    metaInfo: {
        title: 'Monitor - kubeworkz',
    },
    components: {
        kubeDataBoard,
        dateCustomPicker,
        dimensionSelect,
    },
    props: {
        instance: Object,
    },
    data() {
        return {
            // podService: workloadService.getAPIV1,
            queryService: monitorService.queryRange,
            periodList: [
                { name: 'Last 30 minutes', value: 30 * 60 * 1000 },
                { name: 'Last 6 hours', value: 360 * 60 * 1000 },
                { name: 'Last 1 day', value: 1440 * 60 * 1000 },
                // { name: 'Last 7 days', value: 10080 * 60 * 1000 },
            ],
            startTime: 0,
            endTime: 0,
            timeType: 'quick',
            quickValue: 30 * 60 * 1000,
            title: '',

            loading: false,
            variables: [],
            pipeSeq: null,
            variableSelected: {},
            sources: {},

            rows: [],

            pipeLoading: true,
            selectshowable: false,
        };
    },
    computed: {
        namespace: get('scope/namespace@value'),
        cluster: get('scope/cluster@value'),
        controlClusterList: get('scope/controlClusterList'),
        workload() {
            return this.$route.params.workload;
        },

        scope() {
            if (this.instance && this.$route.path.startsWith('/platform')) {
                return {
                    cluster: this.instance.clusterName,
                    node: this.$route.params.nodename,
                };
            }
            const scope = {
                cluster: this.cluster,
                namespace: this.namespace,
            };
            if (this.instance && this.$route.path.startsWith('/control')) {
                Object.assign(scope, {
                    workload: this.instance.metadata.name,
                    pod: this.instance.metadata.name,
                    volume: this.instance.metadata.name,
                    type: this.workload.substr(0, this.workload.length - 1),
                });
            }
            return scope;
        },
        resource() {
            if (this.workload === 'pods') {
                return 'kube-pod-resource';
            }
            if (this.workload === 'persistentvolumeclaims') {
                return 'kube-resource-persistent-volumes';
            }
            if (this.workload) {
                return 'kube-workload-resource';
            }
            return this.$route.meta.resource;

        },
        st() {
            return this.startTime / 1000;
        },
        et() {
            return this.endTime / 1000;
        },
        step() {
            return getStep(this.startTime, this.endTime);
        },
        stepTime() {
            return getStepTime(this.startTime, this.endTime);
        },
    },
    created() {
        this.load();
    },
    mounted() {
        this.$watch(() => [ this.startTime, this.endTime ], () => {
            if (this.$refs.pipeVariables) {
                this.$refs.pipeVariables.pipeRequest();
            }
        });
    },
    methods: {
        handleAsyncPanelShow(data) {
            this.rows.forEach((row, rowIndex) => {
                row.panels.forEach((panel, panelIndex) => {
                    panel.showPanel = data[rowIndex].panels[panelIndex].showPanel;
                });
            });
        },
        async load() {
            this.loading = true;
            const response = await monitorService.getInnerDashboards({
                pathParams: {
                    resource: this.resource,
                    cluster: this.controlClusterList[0].clusterName,
                },
            });

            const resolved = toMonitorPlainObject(response);
            this.title = resolved.spec.title;
            this.variables = resolved.spec.variables || [];
            this.rows = resolved.spec.rows || [];
            this.selectshowable = resolved.spec.selectshowable;
            this.pipeSeq = this.variables.map(v => v.name).join(' > ');
            if (this.variables.length === 0) {
                this.pipeLoading = false;
            }
            this.loading = false;
        },
        async resolveRequest(valve) {
            const name = valve.name;
            const vs = await valve.request({ ...this.scope, ...this.variableSelected }, {
                start: this.st,
                end: this.et,
                step: this.step,
            });
            console.log(vs);
            this.$set(this.sources, name, vs);
            setValueIfListNotPresent({
                list: vs,
                path: 'value',
                current: getFunc(this.variableSelected, name),
            }, val => {
                this.$set(this.variableSelected, name, getFunc(val, 'value'));
            });
        },
        resolver(response) {
            console.log(response);
        },
        updateTime(val) {
            const { startTime, endTime, type, quickValue } = val;
            this.startTime = startTime;
            this.endTime = endTime;
            this.timeType = type;
            this.quickValue = quickValue;
        },
        findLongest(sources) {
            let l = 0;
            let longest = '';
            sources.forEach(s => {
                const p = s.text.length;
                if (p > l) {
                    l = p;
                    longest = s.text;
                }
            });
            return `xxxx${longest}xxxx`;
        },
    },
};
</script>

<style module>
.rowTitle {
    box-sizing: content-box;
    padding: 6px 20px;
    margin: 0;
    height: 30px;
    line-height: 30px;
    color: #333;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e1e8ed;
}
.variableWrapper {
    display: flex;
    flex-wrap: wrap;
}
.variable {
    margin: 10px;
}
.variable > span .occupation {
    display: block;
    visibility: hidden;
    height: 38px;
}
.variable > span .selector {
    position: absolute;
    top: 0;
}
.variable > span{
    position: relative;
    display: inline-block;
    margin-right: 10px;
    vertical-align: middle;
}

.container::after{
    content: ' ';
    display: table;
    clear: both;
}
.container > .block {
    float: left;
    width: 33.333333333%;
    padding: 5px;
}
/* .container > .block[is-table] {
    width: 100%
} */
.container > .block > .chart{
    /* height: 100%; */
    border: 1px solid #dfe4ec;
    padding: 10px;
    margin: 0;
}
.container {
    display: block;
    position: relative;
}
.container::after {
    content: ' ';
    display: table;
    clear: both;
}
.container > .block-12,
.container > .block-11,
.container > .block-10,
.container > .block-9,
.container > .block-8,
.container > .block-7,
.container > .block-6,
.container > .block-5,
.container > .block-4,
.container > .block-3,
.container > .block-2,
.container > .block-1 {
    float: left;
}

.container > .block-1 {
    width: 8.3333333333333%;
}
.container > .block-2 {
    width: 16.666666666666%;
}
.container > .block-3 {
    width: 25%;
}
.container > .block-4 {
    width: 33.3333333333333%;
}
.container > .block-5 {
    width: 41.666666666666%;
}
.container > .block-6 {
    width: 50%;
}
.container > .block-7 {
    width: 58.3333333333333%;
}
.container > .block-8 {
    width: 66.666666666666%;
}
.container > .block-9 {
    width: 75%;
}
.container > .block-10 {
    width: 83.3333333333333%;
}
.container > .block-11 {
    width: 91.666666666666%;
}
.container > .block-12 {
    width: 100%;
}

.container > .chart {
    /* height: ; */
}
</style>
