import { ignoredKeys } from 'kubeworkz/utils/constants';
import cronValidate from 'node-cron/src/pattern-validation';
import YAML from 'yaml';
export const k8sResourceNameValidator = () => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            const message = '1-63 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number';
            if (value.length === 0 || value.length > 63) {
                callback(new Error(message));
            } else if (!/^[a-z]([0-9a-z\-]*[0-9a-z])?$/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const k8sResourceNameEnhanceValidator = () => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            const message = '1-253 lowercase letters, numbers, or underscores, starting with a letter and ending with a letter or number';
            if (value.length === 0 || value.length > 253) {
                callback(new Error(message));
            } else if (!/^[a-z]([0-9a-z\-]*[0-9a-z])?$/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofNumberOrPercentage = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            if (!required && !value) {
                return callback();
            }
            const message = 'Should be a percentage or an integer';
            if (!/^([0-9]+\.)?[0-9]+%$/.test(value) && !/^[0-9]+$/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofNumber = (required, message) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            if (!required && !value) {
                return callback();
            }
            message = message || 'Should be an integer';
            if (!/^[0-9]*$/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const numberBetween = (min = -Infinity, max = Infinity, required, message = '') => {
    return {
        trigger: [ 'blur', 'change' ],
        validator: (rule, value, callback) => {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            message = message || (min === -Infinity ? `Should be less than or equal to ${max}` : '') || (max === Infinity ? `should be greater than or equal to ${min}` : '') || `The range is between ${min}-${max}`;
            if (+(value) > +(max) || +(value) < +(min)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofFloatNumber = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Number format is wrong';
            if (!/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const startsWithSlash = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'starts with "/"';
            if (!/^\//.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofPath = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Contains only letters, numbers, dashes, underscores, "/" and "."';
            if (!/^[a-zA-Z0-9-_/.]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const noRedundance = (list, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Identical item already exists';
            let t = 0;
            list.forEach(p => {
                if (p === value) t++;
            });
            if (t > 1) {
                return callback(new Error(message));
            }
            return callback();
        },
    };
};

export const enhanceNoRedundance = (list, item, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Identical item already exists';
            let t = 0;
            list.forEach(p => {
                if (p === item) t++;
            });
            if (t > 1) {
                return callback(new Error(message));
            }
            return callback();
        },
    };
};

export const consistofSubPath = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Please fill in the relative path';
            if (!/^[a-zA-Z0-9-_.][a-zA-Z0-9-_/.]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const startsWithLetter = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'start with letter';
            if (!/^[a-zA-Z]/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofLetterNumbersUnderscores = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Contains only letters, numbers and underscores';
            if (!/^[a-zA-Z0-9_]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofLetterNumbers = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Contains only uppercase and lowercase letters and numbers';
            if (!/^[a-zA-Z0-9]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const lengthBetween = (min = -Infinity, max = Infinity, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = `The length must not be less than ${min} bits and no longer than ${max} bits`;
            try {
                const v = `${value}`.length;
                if (v >= min && v <= max) {
                    return callback();
                }
                callback(new Error(message));
            } catch (err) {
                callback(new Error(message));
            }
        },
    };
};

export const consistofUnicode = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Contains only unicode';
            if (!/^[\\x00-\\x7F]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const someValueRequired = (list, needed, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'The workload needs to set up at least one business container';
            if (!list.some(l => l === needed)) {
                return callback(new Error(message));
            }
            return callback();
        },
    };
};

export const startsWithLowercaseLetter = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Start with a lowercase letter';
            if (!/^[a-z]/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistoLetterNumbersUnderscores = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Contains only lowercase letters, numbers, and underscores';
            if (!/^[a-z0-9-]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const keyPattern = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'key is illegal';
            let prefix = '';
            let suffix = '';
            const spartIndex = value.indexOf('/');
            if (spartIndex !== -1) {
                prefix = value.slice(0, spartIndex);
                suffix = value.slice(spartIndex + 1);
            } else {
                suffix = value;
            }
            if (prefix.length > 253 || suffix.length > 63) {
                callback(new Error(message));
            } else if (!/^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const noSystemKey = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Cannot use system tags';
            if (ignoredKeys.some(item => value.startsWith(item))) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const required = (message = 'Cannot be empty') => {
    return {
        trigger: [ 'blur', 'change' ],
        required: true,
        message,
    };
};

export const trimRequired = (required, message = 'Cannot be empty') => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            if (!(value || '').trim()) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const labelValuePatten = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Composed of 1-63 letters, numbers, "-", "_" or ".", starting and ending with letters or numbers';
            const l = `${value}`.length;
            if (!(l >= 1 && l <= 63 && /^(([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+\/)?(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(value || ''))) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const multipartLabelValuePatten = (spliter = /\s/, required, message) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const arr = (value || '').split(spliter);
            message = message || 'Composed of 1-63 letters, numbers, "-", "_" or ".", starting and ending with letters or numbers, multiple ones separated by spaces';
            const result = arr.map(item => {
                const l = `${item}`.length;
                if (!(l >= 1 && l <= 63 && /^(([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+\/)?(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(item || ''))) {
                    return false;
                }
                return true;
            });
            if (result.some(r => !r)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const linuxCronPattern = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Linux Cron expression is illegal';
            try {
                cronValidate(value);
                callback();
            } catch (err) {
                callback(new Error(message));
            }
        },
    };
};

export const fixedFieldNum = (length, separator, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = `Consists of ${length} fields separated by "${separator}"`;
            if (value && value.split(separator).length === length) {
                callback();
            } else {
                callback(new Error(message));
            }
        },
    };
};

export const startsWithLowercaseLetterOrNumber = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Start with a lowercase letter or number';
            if (!/^[a-z0-9]/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofLowercaseLetterNumbersUnderscores = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Contain only lowercase letters, numbers, and underscores';
            if (!/^[a-z0-9_]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const endsWithLowercaseLetterOrNumber = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'End with a lowercase letter or number';
            if (!/[a-z0-9]$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const numberBiggerThen = (min = -Infinity, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            const message = `Should be greater than ${min}`;
            const v = +(value);
            if (v <= min) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const someRequired = (list = [], required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Must fill in one';
            if (!list.some(l => l)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const arrayRequired = (filterkey = '') => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!filterkey) {
                callback();
            }
            const filter = Array.isArray(filterkey) ?
                v => filterkey.every(k => !!v[k]) :
                v => !!v[filterkey];
            const message = 'Must fill in one';
            if (Array.isArray(value) && value.filter(filter).length > 0) {
                callback();
            } else {
                callback(new Error(message));
            }
        },
    };
};

export const cookie = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Cookie characters are illegal';
            if (!/^[a-zA-Z0-9_-]{0,1024}$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistofNormalSymbol = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = "Contains only numbers, letters, '-', '_' or '.'";
            if (!/^[\w-.]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const email = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Email format is wrong';
            if (!/^[\w.]+@\w+\.[a-z]{2,3}(\.[a-z]{2,3})?$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const nameExistence = (list = [], required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Name already exists';
            if (list.find(l => l === value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const yaml = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'yaml format error';
            try {
                YAML.parse(value);
                callback();
            } catch (error) {
                callback(new Error(message));
            }
        },
    };
};

export const ingressSuffix = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Please enter a legal ingress suffix';
            if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const greateThenEqual = (nim, message, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            nim = +(nim);
            message = message || `Should be greater than or equal to ${nim}`;
            if (+(value) < nim) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const greateThen = (nim, message, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            nim = +(nim);
            message = message || `Should be greater than ${nim}`;
            if (+(value) <= nim) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const lessThenEqual = (max, message, required) => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && (value !== 0 && !value)) {
                return callback();
            }
            max = +(max);
            message = message || `Should be less than or equal to ${max}`;
            if (+(value) > max) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const clusterDisplayName = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = '1-100 characters, starting or ending with characters, letters, and numbers, supporting underline and center line';
            if (!/^([a-zA-Z0-9][a-zA-Z0-9_-]{0,98})?[a-zA-Z0-9]$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const cidr = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'CIDR is illegal';
            if (!/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([1-2][0-9]|3[0-2]|[0-9]))$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const urlpattern = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'URL is illegal';
            try {
                new URL(value);
                callback();
            } catch (err) {
                callback(new Error(message));
            }
        },
    };
};

export const startsWithHTTPProtocol = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Start with http:// or https://';
            if (!/^https?:\/\//.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const consistoLetterNumbersSplitterDot = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Contains only letters, numbers, dashes, underlines, and dots';
            if (!/^[._a-z0-9-]*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const noEmptyChar = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Contains only non-whitespace characters';
            if (!/^\S*$/.test(value || '')) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

export const requiredLetterNumbers = required => {
    return {
        trigger: [ 'blur', 'change' ],
        validator(rule, value, callback) {
            if (!required && !value) {
                return callback();
            }
            const message = 'Must contain uppercase and lowercase letters and numbers';
            if (!/[0-9]/.test(value) || !/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
                callback(new Error(message));
            } else {
                callback();
            }
        },
    };
};

