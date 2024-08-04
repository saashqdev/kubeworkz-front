<template>
    <div :class="$style.root" :style="style">
    </div>
</template>

<script>
import debounce from 'lodash.debounce';
import defaultOptions from './defaultOptions';
import * as monaco from 'monaco-editor';
export default {
    name: 'qz-editor',
    model: {
        prop: 'value',
        event: 'change',
    },
    props: {
        width: { type: [ String, Number ], default: '100%' },
        height: { type: [ String, Number ], default: '100%' },
        value: { type: String, default: '' }, // Editor initial display text
        language: { type: String, default: 'javascript' }, // language support
        theme: { type: String, default: 'vs' }, // There are three official themes: vs, hc-black, or vs-dark
        options: { type: [ Array, Object ], default: () => {} }, // Configuration
        highlighted: { type: Array, default: () => [{
            number: 0,
            class: '',
        }] },
        changeThrottle: { type: Number, default: 0 },

        // diff
        type: { type: String, default: 'normal' }, // diff
        originalValue: { type: String, default: '' },
        disabled: { type: Boolean, default: false },
    },
    data() {
        return {
            editor: null, // text editor return {
            defaults: {
                ...JSON.parse(JSON.stringify(defaultOptions)),
            },
            originalEditor: null, // diff mode
        };
    },
    computed: {
        isDiff() {
            return this.type === 'diff';
        },
        style() {
            const { width, height } = this;
            const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`;
            const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`;
            return {
                width: fixedWidth,
                height: fixedHeight,
            };
        },
        editorOptions() {
            const options = (Array.isArray(this.options) ? this.options[0] : this.options) || {};
            return Object.assign({}, this.defaults, options, {
                value: this.value,
                language: this.language,
                theme: this.theme,
            });
        },
    },
    watch: {
        options() {
            this.editor && this.editor.updateOptions(this.editorOptions);
            // originalEditor It is metadata in the diff scenario, and direct operation is not advisable.
            // this.originalEditor && this.originalEditor.updateOptions(this.editorOptions);
        },
        highlighted: {
            handler(lines) {
                this.highlightLines(lines);
            },
            deep: true,
        },
        language(nV, oV) {
            if (nV && nV !== oV) {
                if (this.editor) {
                    this.editor.setModelLanguage(this.editor.getModel(), nV);
                }
                if (this.originalEditor) {
                    this.originalEditor.setModelLanguage(this.originalEditor.getModel(), nV);
                }
            }
        },
        value(nV, oV) {
            if (!this.editor) {
                return;
            }
            if (!oV && nV !== oV) { // This is only processed when value is empty, otherwise the cursor will remain out of focus.
                // Update text in editor
                this.editor.setValue(nV);
                this.editor.setPosition({column: Infinity, lineNumber: Infinity});
            }
        },
        originalValue(nV, oV) {
            if (!this.originalEditor) {
                return;
            }
            if (nV !== oV) {
                // Update the text of the comparison
                return this.originalEditor.setValue(nV);
            }
        },
    },
    methods: {
        highlightLines(lines) {
            if (!this.editor) {
                return;
            }
            lines.forEach(line => {
                const className = line.class;
                const highlighted = this.$el.querySelector(`.${className}`);
                if (highlighted) {
                    highlighted.classList.remove(className);
                }
                const number = parseInt(line.number);
                if (!this.editor && number < 1 || isNaN(number)) {
                    return;
                }
                const selectedLine = this.$el.querySelector(`.view-lines [linenumber="${number}"]`);
                if (selectedLine) {
                    selectedLine.classList.add(className);
                }
            });
        },
        codeChangeHandler(editor, event) {
            if (this.codeChangeEmitter) {
                this.codeChangeEmitter(editor);
            } else {
                this.codeChangeEmitter = debounce(
                    function(editor) {
                        this.$emit('codeChange', editor);
                        const _v = editor.getValue();
                        this.$emit('change', _v);
                    },
                    this.changeThrottle
                );
                this.codeChangeEmitter(editor);
            }
        },
        createMonaco() {
            // Initialize the editor and ensure that the dom has been rendered
            if (this.isDiff) {
                const originalModel = monaco.editor.createModel(this.originalValue);
                const modifiedModel = monaco.editor.createModel(this.value);

                const diffEditor = monaco.editor.createDiffEditor(this.$el, this.editorOptions);
                diffEditor.setModel({
                    original: originalModel,
                    modified: modifiedModel,
                });
                this.originalEditor = diffEditor.getOriginalEditor();
                this.editor = diffEditor.getModifiedEditor();
            } else {
                this.editor = monaco.editor.create(this.$el, this.editorOptions);
            }
            this.editor.onDidChangeModelContent(event =>
                this.codeChangeHandler(this.editor, event)
            );
        },
        getValue() {
            if (!this.editor) {
                return;
            }
            return this.editor.getValue(); // Get the text in the editor
        },
        destroyMonaco() {
            if (this.editor) {
                this.editor.dispose();
                this.editor = null;
            }
        },
        setValue(nV) {
            if (!this.editor) {
                return;
            }
            return this.editor.setValue(nV); // Reset text in editor
        },
    },
    mounted() {
        this.createMonaco();
    },
    destroyed() {
        this.destroyMonaco();
    },
};
</script>

<style lang="scss" module>
    .root {
        position: relative;
    }
    .root div[class ^='visible'] {
        background: #F9F9F9;
    }
    .root div[class *='scrollbar'] div[class *='slider'] {
        border-radius: 3px;
    }
</style>
