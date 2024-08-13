<template>
  <el-form-item
    label="Update strategy"
  >
    <el-form-item
      style="display:flex;margin-bottom: 22px;"
      prop="spec.strategy.minReadySeconds"
    >
      <template slot="label">
        Minimum ready time
        <el-tooltip
          effect="dark"
          content="Minimum readiness time: After a newly created copy is ready, it needs to remain normal before it is considered available, unit (seconds)"
          placement="right"
          popper-class="ncs-el-tooltip-popper"
        >
          <i
            class="el-icon-question"
            style="position: absolute;right:4px;top:11px"
          />
        </el-tooltip>
      </template>
      <el-input
        v-model="model.minReadySeconds"
        placeholder="Please enter an integer from 5-300"
      />
    </el-form-item>
    <el-form-item
      style="display:flex;margin-bottom: 22px;"
      prop="spec.strategy.maxSurge"
    >
      <template slot="label">
        Maximum number of copies beyond expectations
        <el-tooltip
          effect="dark"
          content="Maximum number of copies beyond expected: The maximum number or percentage of copies that can be created that exceeds the number of copies required"
          placement="right"
          popper-class="ncs-el-tooltip-popper"
        >
          <i
            class="el-icon-question"
            style="position: absolute;right:4px;top:11px"
          />
        </el-tooltip>
      </template>
      <el-input
        v-model="model.maxSurge"
        placeholder="Fill in the percentage or integer"
      />
    </el-form-item>
    <el-form-item
      style="display:flex;margin-bottom: 22px;"
      prop="spec.strategy.maxUnavailable"
    >
      <template slot="label">
        Maximum number of unusable copies
        <el-tooltip
          effect="dark"
          content="Maximum number of unavailable replicas: the upper limit number or percentage of replicas that cannot be used during the update process"
          placement="right"
          popper-class="ncs-el-tooltip-popper"
        >
          <i
            class="el-icon-question"
            style="position: absolute;right:4px;top:11px"
          />
        </el-tooltip>
      </template>
      <el-input
        v-model="model.maxUnavailable"
        placeholder="Fill in the percentage or integer"
      />
    </el-form-item>
  </el-form-item>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional.js';

export default {
    mixins: [ makeVModelMixin ],

};
</script>

<style>

</style>
