<template>
  <el-dialog
    title="Configure EmptyDir"
    :visible.sync="show"
    width="800px"
    @close="close"
    :close-on-click-modal="false"
  >
    <el-alert title="Please set a reasonable size EmptyDir to avoid affecting other workloads on the same node." type="warning" show-icon :closable="false"/>
    <el-form ref="form" :model="model" label-position="right" label-width="120px">
      <el-form-item label="EmptyDir">
        <div style="color: #999;">It is suitable for scenarios such as sharing data generated during runtime and temporary data storage. Operations such as restarting and deleting the load will cause the temporary path to be deleted.</div>
        <dynamicBlock
          v-model="model.emptyDirs"
          :getDefaultItem="getDataTemplate"
          :columns="[
              {
                  title: 'EmptyDir name',
                  dataIndex: 'name',
              },
              {
                  title: 'Medium',
                  dataIndex: 'medium'
              },
              {
                  title: 'Size',
                  dataIndex: 'sizeLimit'
              },
              {
                  title: '',
                  dataIndex: 'unit',
                  width: '60px'
              }
          ]"
        >
          <template v-slot:name="{record, index}">
            <el-form-item 
              label=""
              :prop="`emptyDirs.${index}.name`"
              :rules="[
                validators.startsWithLowercaseLetterOrNumber(false),
                validators.consistofLowercaseLetterNumbersUnderscores(false),
                validators.endsWithLowercaseLetterOrNumber(false),
                validators.noRedundance(allName, false)
              ]"
            >
              <el-input
                v-model="record.name"
              />
            </el-form-item>
          </template>
          <template v-slot:medium="{record}">
            <el-select v-model="record.medium" placeholder="Please choose" filterable>
              <el-option
                v-for="item in mediums"
                :key="item.value"
                :label="item.text"
                :value="item.value">
              </el-option>
            </el-select>
          </template>
          <template v-slot:sizeLimit="{record}">
            <div style="display: flex">
              <el-input-number v-model="record.sizeLimit" controls-position="right" :min="1"/>
            </div>
          </template>
          <template slot="unit">
            MiB
          </template>
        </dynamicBlock>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="close">Cancel</el-button>
      <el-button type="primary" @click="submit">OK</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { cloneDeep } from 'lodash';
import * as validators from 'kubeworkz/utils/validators';
export default {
    // mixins: [ makeVModelMixin ],
    props: {
        podVolumes: Object,
    },
    data() {
        return {
            show: false,
            mediums: [
                { text: 'Memory', value: 'Memory' },
                { text: 'Disk', value: '' },
            ],
            validators,
            model: {
                emptyDirs: cloneDeep(this.podVolumes.emptyDir),
            },
        };
    },
    computed: {
        allName() {
            return this.model.emptyDirs.map(m => m.name);
        },
    },
    methods: {
        open() {
            this.emptyDirs = cloneDeep(this.podVolumes.emptyDir);
            this.show = true;
        },
        close() {
            this.show = false;
        },
        getDataTemplate() {
            return {
                name: '',
                medium: 'Memory',
                sizeLimit: 300,
            };
        },
        async submit() {
            // Trigger verification
            try {
                await this.$refs.form.validate();
            } catch (error) {
                return;
            }
            this.$emit('change', cloneDeep(this.model.emptyDirs.filter(dir => dir.name)));
            this.close();
        },
    },
};
</script>

<style>

</style>
