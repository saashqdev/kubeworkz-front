<template>
  <div>
    <el-form-item
      label="Task setting"
    >
      <el-form-item
        label=""
        style="display:flex;margin-bottom: 22px;"
      >
        <!-- <div style="color: #999;">The number of Pods that need to be successfully executed for the task to reach execution completion status</div> -->
        <template slot="label">
          Expected number of successful executions
          <el-tooltip
            effect="dark"
            placement="right"
            popper-class="ncs-el-tooltip-popper"
          >
            <div slot="content">
              The number of Pods that need to be successfully executed for the task to reach execution completion status
            </div>
            <i
              class="el-icon-question"
              style="position: absolute;right:4px;top:11px"
            />
          </el-tooltip>
        </template>
        <el-input-number
          v-model="model.completions"
          controls-position="right"
          :min="1"
          style="width: 300px;"
          :step-strictly="true"
        />
      </el-form-item>
      <el-form-item
        label=""
        style="display:flex;margin-bottom: 22px;"
      >
        <!-- <div style="color: #999;">The maximum number of Pods allowed to be created simultaneously during task execution. The number of parallelism should not be greater than the number of executions.</div> -->
        <template slot="label">
          Parallel number
          <el-tooltip
            effect="dark"
            placement="right"
            popper-class="ncs-el-tooltip-popper"
          >
            <div slot="content">
              The maximum number of Pods allowed to be created simultaneously during task execution. The number of parallelism should not be greater than the number of executions.
            </div>
            <i
              class="el-icon-question"
              style="position: absolute;right:4px;top:11px"
            />
          </el-tooltip>
        </template>
        <el-input-number
          v-model="model.parallelism"
          controls-position="right"
          :min="1"
          style="width: 300px;"
          :step-strictly="true"
        />
      </el-form-item>
      <el-form-item
        label=""
        style="display:flex;margin-bottom: 22px;"
        :prop="`${prefixProp}.activeDeadlineSeconds`"
        :rules="[
          validators.consistofNumber(false),
        ]"
      >
        <!-- <div style="color: #999;">When the task execution exceeds this time, the task will be marked as failed and all Pod instances under the task load will be deleted. When empty, it means no timeout is set.</div> -->
        <template slot="label">
          Overtime time
          <el-tooltip
            effect="dark"
            placement="right"
            popper-class="ncs-el-tooltip-popper"
          >
            <div slot="content">
              When the task execution exceeds this time, the task will be marked as failed and all Pod instances under the task load will be deleted. When empty, it means no timeout is set.
            </div>
            <i
              class="el-icon-question"
              style="position: absolute;right:4px;top:11px"
            />
          </el-tooltip>
        </template>
        <el-input
          v-model="model.activeDeadlineSeconds"
          style="width: 300px;"
        />
        <span style="margin-left:8px">秒</span>
      </el-form-item>
      <el-form-item
        label="Number of retries"
        style="margin-bottom:22px"
      >
        <el-input-number
          v-model="model.backoffLimit"
          controls-position="right"
          :min="1"
          style="width: 300px;"
          :step-strictly="true"
        />
      </el-form-item>
    </el-form-item>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import * as validators from 'kubeworkz/utils/validators';
export default {
    mixins: [ makeVModelMixin ],
    props: {
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
};
</script>

<style>

</style>
