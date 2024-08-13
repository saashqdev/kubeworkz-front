<template>
  <u-modal
    class="form-error-block"
    :title="title"
    ok-button=""
    cancel-button=""
    :visible.sync="show"
    size="huge"
    @close="close"
  >
    <u-easy-copy :text="sortModel" />
    <x-ace-editor
      ref="editor"
      v-model="sortModel"
      disabled
      lang="yaml"
      theme="textmate"
      :options="editorOptions"
    />
  </u-modal>
</template>

<script>
import XAceEditor from 'cloud-ui.vusion/packages/x-ace-editor.vue';
import { Modal } from '@micro-app/common/base/mixins';
import yamljs from 'yamljs';


export default {
    name: 'UViewYaml',
    components: {
        'x-ace-editor': XAceEditor,
    },
    mixins: [ Modal ],
    props: {
        model: { type: Object, default: () => ({}) },
    },
    data() {
        return {
            title: 'Check the details',
            isObject: !(this.list instanceof Array),
            editorOptions: {
                tabSize: 2,
                scrollPastEnd: 0.2,
            },
        };
    },
    computed: {
        sortModel() {
            return yamljs.stringify(this.model, 20, 2);
        },
    },
};
</script>
