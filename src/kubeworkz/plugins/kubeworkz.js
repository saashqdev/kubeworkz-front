import Vue from 'vue';
import router from 'kubeworkz/router';

import kubeForm from 'kubeworkz/component/common/kube-form/kube-form.vue';
import kubeFormItem from 'kubeworkz/component/common/kube-form/kube-form-item.vue';
import kubeTable from 'kubeworkz/component/common/kube-table/index.vue';
import kubeDynamicBlock from 'kubeworkz/component/common/kube-dynamic-block.vue';
import xRequest from 'kubeworkz/component/common/x-request.vue';
import xScope from 'kubeworkz/component/common/x-scope.vue';
import kubeInputSearch from 'kubeworkz/component/common/kube-search/kube-input-search.vue';
import kubeValve from 'kubeworkz/mixins/pipe/kube-valve.vue';
import kubePipe from 'kubeworkz/mixins/pipe/kube-pipe.vue';
import kubeChart from 'kubeworkz/component/common/kube-chart/template/index.js';
import kubeDataTable from 'kubeworkz/component/common/kube-data-table/kube-data-table.vue';
import kubeCheckboxBoard from 'kubeworkz/component/common/kube-checkbox-board/kube-checkbox-board.vue';
import kubeCheckboxTree from 'kubeworkz/component/common/kube-checkbox-tree/kube-checkbox-tree.vue';
import kubeTree from 'kubeworkz/component/common/kube-checkbox-tree/kube-tree.vue';
import kubeTimer from 'kubeworkz/component/common/kube-timer/index.vue';
import kubeTab from 'kubeworkz/component/common/kube-form-tab/index.vue';
import kubeListBlock from 'kubeworkz/component/common/kube-block-list/index.vue';
import kubeMonacoEditor from 'kubeworkz/component/common/kube-monaco-editor.vue';
// form
import kubeNameInput from 'kubeworkz/component/global/form-common/kube-name-input.vue';
import kubeDeploymentSelectorInput from 'kubeworkz/component/global/form-common/kube-deployment-input.vue';
import kubeLabelEditor from 'kubeworkz/component/global/k8s/label-editor';
import kubePlainLabelEditor from 'kubeworkz/component/global/k8s/plain-label-editor.vue';
import kubeDynamicLabels from 'kubeworkz/component/common/kube-dynamic-labels.vue';
import qzLinkGroup from 'kubeworkz/elComponent/qz-link-group';
import statusIcon from 'kubeworkz/elComponent/status-icon';
import elLink from 'kubeworkz/elComponent/el-link';
import headCard from 'kubeworkz/elComponent/head-card';
import operateList from 'kubeworkz/elComponent/operate-list/index.vue';
import operateButtonOption from 'kubeworkz/elComponent/operate-list/operate-button-option.vue';
import qzTerminal from 'kubeworkz/elComponent/qz-terminal';
import dynamicBlock from 'kubeworkz/elComponent/dynamic-block';
import dynamicCard from 'kubeworkz/elComponent/dynamic-card';
import dynamicTab from 'kubeworkz/elComponent/dynamic-tab.vue';
import QzEditor from 'kubeworkz/elComponent/qz-editor';
import LabelEditor from 'kubeworkz/elComponent/label-editor.vue';
import EnhanceQzEditor from 'kubeworkz/elComponent/enhance-qz-editor';
import TagList from 'kubeworkz/elComponent/tagList.vue';


// elComponent
import elInputSearch from 'kubeworkz/elComponent/inputSearch';

// Instruction Set
import directives from 'kubeworkz/directives';

const SKELETON_KEY = 'SKELETON_KEY';
const SKELETON_RAW_DATA = 'SKELETON_RAW_DATA';
function loadingElm(el) {
    const status = el.getAttribute('sk-status');
    if (status === 'loading') {
        const node = el[SKELETON_KEY];
        el.innerHTML = node;
    }
    if (status === 'loaded') {
        el.innerHTML = el[SKELETON_RAW_DATA];
    }
}
const ELLIPSIS_KEY = 'SKELETON_KEY';
function addEllipsis(el, length) {
    const content = el.innerHTML;
    const nodeElem = `<span>${content.substring(0, length)}...</span>`;
    // el.addEventListener('click', (e))
    const href = document.createElement('a');
    href.innerText = 'Expand';
    href.setAttribute('class', 'ellipsis-action');
    href.addEventListener('click', e => {
        e.preventDefault();
        el.innerHTML = `<span>${content}</span>`;
        el[ELLIPSIS_KEY] = false;
    });
    el.innerHTML = nodeElem;
    el.appendChild(href);
}
// Introduce Element
import ElementUI from 'element-ui';
Vue.use(ElementUI, { size: 'medium' });
Vue.use({
    install(_Vue) {
        _Vue.component('TagList', TagList);
        _Vue.component('EnhanceQzEditor', EnhanceQzEditor);
        _Vue.component('LabelEditor', LabelEditor);
        _Vue.component('QzEditor', QzEditor);
        _Vue.component('DynamicTab', dynamicTab);
        _Vue.component('DynamicCard', dynamicCard);
        _Vue.component('DynamicBlock', dynamicBlock);
        _Vue.component('QzTerminal', qzTerminal);
        _Vue.component('OperateButtonOption', operateButtonOption);
        _Vue.component('OperateList', operateList);
        _Vue.component('HeadCard', headCard);
        _Vue.component('HeadCard', headCard);
        _Vue.component('ElLink', elLink);
        _Vue.component('StatusIcon', statusIcon);
        _Vue.component('QzLinkGroup', qzLinkGroup);
        _Vue.component('ElInputSearch', elInputSearch);
        _Vue.component('XRequest', xRequest);
        _Vue.component('XScope', xScope);
        _Vue.component('KubeForm', kubeForm);
        _Vue.component('KubeFormItem', kubeFormItem);
        _Vue.component('KubeTable', kubeTable);
        _Vue.component('KubeInputSearch', kubeInputSearch);
        _Vue.component('KubeValve', kubeValve);
        _Vue.component('KubePipe', kubePipe);
        _Vue.component('KubeDynamicBlock', kubeDynamicBlock);
        _Vue.component('KubeNameInput', kubeNameInput);
        _Vue.component('KubeDeploymentSelectorInput', kubeDeploymentSelectorInput);
        _Vue.component('KubeLabelEditor', kubeLabelEditor);
        _Vue.component('KubePlainLabelEditor', kubePlainLabelEditor);
        _Vue.component('KubeChart', kubeChart);
        _Vue.component('KubeDataTable', kubeDataTable);
        _Vue.component('KubeCheckboxBoard', kubeCheckboxBoard);
        _Vue.component('KubeCheckboxTree', kubeCheckboxTree);
        _Vue.component('KubeTree', kubeTree);
        _Vue.component('KubeTimer', kubeTimer);
        _Vue.component('KubeTab', kubeTab);
        _Vue.component('KubeListBlock', kubeListBlock);
        _Vue.component('KubeMonacoEditor', kubeMonacoEditor);
        _Vue.component('KubeDynamicLabels', kubeDynamicLabels);

        _Vue.filter('formatLocaleTime', function(value) {
            if (!value) return '-';
            const datetime = new Date(value);
            return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'medium' }).format(datetime);
        });

        const MAP_1000 = [ '', 'k', 'M', 'G', 'T', 'P', 'E' ];
        _Vue.filter('cpuTextFilter', function(value) {
            if (!value) return '-';
            value = parseInt(value);
            const index = Math.max(0, Math.floor(Math.log10(value)));
            const p = value / Math.pow(1000, index);
            return `${p.toFixed(2)}${MAP_1000[index]} Cores`;
        });

        const MAP_1024 = [ '', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei' ];
        const lg1024 = Math.log(1024);
        _Vue.filter('memoTextFilter', function(value) {
            if (!value) return '-';
            value = parseInt(value);
            const index = Math.max(0, Math.floor(Math.log(value) / lg1024));
            const p = value / Math.pow(1024, index);
            return `${p.toFixed(2)}${MAP_1024[index]}B`;
        });
        _Vue.directive('toPath', function(el, binding) {
            el.onclick = () => router.push(binding.value);
        });
        _Vue.directive('skeleton', {
            inserted(el, binding) {
                _Vue.nextTick(() => {
                    const color = binding.value;
                    const { width, height } = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    const lineHeight = parseInt(computedStyle.lineHeight);
                    const fontSize = parseInt(computedStyle.fontSize);
                    const paddingLeft = parseInt(computedStyle.paddingLeft);
                    const paddingRight = parseInt(computedStyle.paddingRight);
                    const paddingTop = parseInt(computedStyle.paddingTop);
                    const paddingBottom = parseInt(computedStyle.paddingBottom);
                    let lines = Math.floor((height - paddingTop - paddingBottom) / lineHeight);
                    const widthActual = width - paddingLeft - paddingRight;
                    const nodeElem = `<span class="skeleton" ${color} style="display:inline-block;width:${widthActual}px;height:${fontSize}px;"></span>`;
                    let node = nodeElem;
                    while (lines > 1) {
                        node += nodeElem;
                        lines--;
                    }
                    el[SKELETON_KEY] = node;
                    el[SKELETON_RAW_DATA] = el.innerHTML;

                    loadingElm(el);
                });

            },
            update(el) {
                loadingElm(el);
            },
        });


        _Vue.directive('ellipsis', {
            inserted(el, binding) {
                _Vue.nextTick(() => {
                    const length = binding.value;
                    if (length === 0) return;
                    if (el.innerText.length > length) {
                        addEllipsis(el, length);
                        el[ELLIPSIS_KEY] = true;
                    }
                });

            },
            update(el, binding) {
                _Vue.nextTick(() => {
                    const length = binding.value;
                    if (length === 0) return;
                    if (el[ELLIPSIS_KEY] === true) {
                        addEllipsis(el, length);
                    }

                });
            },
        });
        directives.forEach(directive => {
            _Vue.directive(directive.name, directive);
        });
    },
});
