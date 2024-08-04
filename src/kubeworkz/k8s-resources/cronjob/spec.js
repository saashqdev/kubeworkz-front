import {
    toNumber,
} from 'lodash';
import {
    getFromModel,
    toObjectArray,
    genReset,
} from '../base/utils';
import {
    toK8SObject as toJobSpecK8SObject,
    toModifyK8SObject as toModifyJobK8SObject,
} from '../job/spec';

export const toPlainObject = model => {
    const g = getFromModel(model);
    return {
        // ...pickBy(g('spec'), v => !isObjectLike(v)),
        concurrencyPolicy: g('spec.concurrencyPolicy', 'Allow'), // Concurrency strategy
        schedule: g('spec.schedule'), // Schedule scheduling settings
        successfulJobsHistoryLimit: g('spec.successfulJobsHistoryLimit'), // Keep the number of successfully executed tasks
        failedJobsHistoryLimit: g('spec.failedJobsHistoryLimit'), // Keep the number of failed tasks
        startingDeadlineSeconds: g('spec.startingDeadlineSeconds'), // Task start deadline
        matchLabels: toObjectArray(g('spec.selector.matchLabels', {}), 'key', 'value'),
        suspend: g('spec.suspend'), // Whether to pause
    };
};

export const toK8SObject = (model, metadata, obj) => {
    const g = getFromModel(model);
    const template = obj.spec.template;
    return {
        concurrencyPolicy: toNumber(g('spec.concurrencyPolicy')), // Concurrency strategy
        schedule: g('spec.schedule'), // Schedule scheduling settings 
        successfulJobsHistoryLimit: toNumber(g('spec.successfulJobsHistoryLimit')), // Keep the number of successfully executed tasks
        failedJobsHistoryLimit: toNumber(g('spec.failedJobsHistoryLimit')), // Keep the number of failed tasks
        startingDeadlineSeconds: g('spec.startingDeadlineSeconds') && toNumber(g('spec.startingDeadlineSeconds')), // Task start deadline
        template: undefined,
        jobTemplate: { // Specifies the job that will be created when the CronJob is executed
            spec: {
                ...toJobSpecK8SObject(g('jobTemplate')),
                template,
                selector: undefined,
            },
        },
    };
};

export const toModifyK8SObject = (target, model) => {
    const resetProperty = genReset(target, model);
    resetProperty('spec.concurrencyPolicy');
    resetProperty('spec.schedule');
    resetProperty('spec.successfulJobsHistoryLimit');
    resetProperty('spec.failedJobsHistoryLimit');
    resetProperty('spec.startingDeadlineSeconds');
    toModifyJobK8SObject(target.jobTemplate, model.jobTemplate);
};
