import { Modal, Subscribe, Page as InitPage } from '@necfe/cloud-ui-internal/src/mixins.js';
import Inputs from './inputs';

// Add selectPage method to Page
const Page = Object.assign({}, InitPage, {
    methods: Object.assign({}, InitPage.methods, {
        // Change the number of pages || callback function for limit operation
        selectPage({ pageSize, page = 1 }) {
            this.page = page;
            this.form && Object.assign(this.form, {
                limit: pageSize,
                offset: (page - 1) * pageSize,
            });
            this.loadList && this.loadList();
        },
    }),
});

export {
    Modal, Subscribe, Page, Inputs,
};
