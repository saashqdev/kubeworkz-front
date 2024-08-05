<template>
  <u-modal
    :visible.sync="show"
    title="Log export"
    size="huge"
    ok-button=""
    cancel-button=""
    @close="close"
  >
    <u-form>
      <!-- <u-form-item label="Select save path" name="path">
               <u-input size="huge" :value="model.path" readonly @click="showDefaultFolder"></u-input>
            </u-form-item> -->
      <u-form-item
        label="Log saving format"
        name="path"
      >
        <u-select
          v-model="model.ext"
          size="normal"
          :data="formats"
        />
      </u-form-item>
      <u-form-item
        label="Number of exported files"
        name="path"
      >
        <u-number-input
          v-model="model.capacity"
          :min="1"
          :max="total"
        /> Strip
      </u-form-item>
      <!-- <u-form-item
        v-if="logseerSensitiveSwitch"
        label="Export sensitive data"
        name="path"
      >
        <u-radios v-model="model.desensitize">
          <u-radio :label="false">
            Yes
          </u-radio>
          <u-radio :label="true">
            No
          </u-radio>
        </u-radios>
      </u-form-item>
      <u-form-item>
        <p>Export instructions:</p>
        <ol>
          <li>The original log export format is .txt, and the CSV format export format is .csv</li>
          <li>The files are uniformly named: log file name - download time (year, month, day - hours, minutes and seconds)</li>
          <li>When the data volume of the export file reaches the set value, a new export task will be automatically created and a new export file will be generated.</li>
        </ol>
      </u-form-item> -->
      <u-submit-button
        :click="submit.bind(this)"
        place="right"
      >
        <template slot-scope="scope">
          <u-linear-layout>
            <u-button
              color="primary"
              :disabled="scope.submitting"
              :icon="scope.submitting ? 'loading' : ''"
              @click="scope.submit"
            >
              OK
            </u-button>
            <u-button @click="close">
              Cancel
            </u-button>
          </u-linear-layout>
        </template>
      </u-submit-button>
      <!-- <input style="display: none;" @change="onFileChange" ref="hiddenInput" type="file" webkitdirectory></input> -->
    </u-form>
  </u-modal>
</template>

<script>
import { mapState } from 'vuex';
export default {
    props: {
        bodyBuilder: Function,
        total: Number,
    },
    data() {
        return {
            model: {
                path: '',
                ext: 'txt',
                capacity: 1,
                desensitize: false,
            },
            formats: [
                { text: 'text', value: 'txt' },
                { text: 'csv', value: 'csv' },
            ],
            show: false,
        };
    },
    computed: mapState({
        tenantId: state => state.scope.tenant.id,
        projectId: state => state.scope.project.id,
    }),
    methods: {
        open() {
            this.show = true;
        },
        close() {
            this.show = false;
        },
        // showDefaultFolder() {
        //     this.$refs.hiddenInput.click();
        // },
        // onFileChange(e) {
        //     console.log(e.target.value);
        //     var theFiles = e.target.files;
        //     var relativePath = theFiles[0].webkitRelativePath;
        //     console.log(theFiles[0]);
        // },
        submit() {
            const {
                ext, capacity,
            } = this.model;
            const body = this.bodyBuilder();
            if (body instanceof Promise) return;
            body.size = capacity;
            const headers = {
                'x-auth-projectId': this.tenantId,
                'x-auth-tenantId': this.projectId,
                'Content-Type': 'application/json',
                Origin: '*',
            };
            let filename = '';
            const url = `/logseer/proxy/api/v1/logseer/extends/elasticsearch/export?format=${ext}`;
            // if (logseerSensitiveSwitch) {
            //     url = `/logseer/proxy/api/v1/logseer/extends/elasticsearch/export?format=${ext}&desensitize=${desensitize}`;
            // }
            return fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            }).then(response => {
                filename = /filename=(.*)/.exec(response.headers.get('content-disposition'))[1];
                return response.blob();
            }).then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                a.click();
                a.remove(); // afterwards we remove the element again
            });

        },
    },
};
</script>

<style module>
.checkbox {
    display: inline-block;
    width: 25%;
    margin-right: 0px;
}
</style>
