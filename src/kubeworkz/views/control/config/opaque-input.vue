<template>
  <div>
    <dynamicBlock
      v-model="model"
      :get-default-item="getDataTemplate"
      :columns="[
        {
          title: 'Key',
          dataIndex: 'key',
        },
        {
          title: 'Value',
          dataIndex: 'value',
        }
      ]"
    >
      <template #key="{record: dataModel, index: dataIndex}">
        <el-form-item
          label=""
          :prop="`${prefixProp}.${dataIndex}.key`"
          :rules="[
            validators.consistofNormalSymbol(false),
          ]"
        >
          <el-input
            v-model="dataModel.key"
            placeholder="Key consists of numbers, letters, '-', '_' or '.'"
          />
        </el-form-item>
      </template>
      <template #value="{record: dataModel}">
        <el-input v-model="dataModel.value" />
      </template>
    </dynamicBlock>
  </div>
</template>

<script>
import { makeVModelMixin } from 'kubeworkz/mixins/functional';
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block/index.vue';
import * as validators from 'kubeworkz/utils/validators';
export default {
    components: {
        dynamicBlock,
    },
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
    computed: {
        exsitKeys() {
            return this.model.map(t => t.key);
        },
    },
    methods: {
        getDataTemplate() {
            return {
                key: '',
                value: '',
                disabled: false,
            };
        },
    },
};
</script>

<style module>
.wrap {
    position: relative;

}
.wrap:hover > .zoom {
    display: block;
}
.wrap[readonly]:hover > .zoom {
    display: none;
}

.textarea[class] {
    width: 100%;
    height: 40px;
    line-height: 28px;
}
.textarea[isExpand] {
    height: 150px;
}

.zoom {
    display: none;
    position: absolute;
    top: 9px;
    right: 10px;
    color: #9ba4ad;
}
.zoom:before {
    icon-font: url(@micro-app/common/assets/icons/svg/apm-extend.svg);
}
.zoom[isExpand]:before {
    icon-font: url(@micro-app/common/assets/icons/svg/apm-small.svg);
}
</style>
