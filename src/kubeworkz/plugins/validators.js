import {
    validate,
} from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import isValidGlob from 'is-valid-glob';
import { ignoredKeys } from 'kubeworkz/utils/constants';
import cronValidate from 'node-cron/src/pattern-validation';
import yamljs from 'yamljs';

export const rules = {
    required: {
        ...required,
        message: 'Required fields',
    },
    noEmptyArray: {
        validate: v => v.length > 0,
        message: 'Required fields',
    },
    arrayRequired: {
        params: [ 'filterkey' ],
        validate: (v, { filterkey }) => {
            if (!filterkey) return true;
            const filter = Array.isArray(filterkey) ?
                v => filterkey.every(k => !!v[k]) :
                v => !!v[filterkey];
            return Array.isArray(v) && v.filter(filter).length > 0;
        },
        message: 'Required fields',
    },
    Cookie: {
        validate: v => /^[-!#$%&'*+.`|~^\w]*$/.test(v),
        message: 'Cookie characters are illegal',
    },

    startsWithLowercaseLetter: {
        validate: v => /^[a-z]/.test(v || ''),
        message: 'Start with a lowercase letter',
    },
    startsWithSlash: {
        validate: v => /^\//.test(v || ''),
        message: 'Start with slash',
    },
    endsWithSlash: {
        validate: v => /\/$/.test(v || ''),
        message: 'End with "/"',
    },
    startsWithLetter: {
        validate: v => /^[a-zA-Z]/.test(v || ''),
        message: 'Start with letter',
    },
    startsWithLetterOrNumber: {
        validate: v => /^[a-zA-Z0-9]/.test(v || ''),
        message: 'Start with a letter or number',
    },
    startsWithLowercaseLetterOrNumber: {
        validate: v => /^[a-z0-9]/.test(v || ''),
        message: 'Start with a lowercase letter or number',
    },
    endsWithLowercaseLetterOrNumber: {
        validate: v => /[a-z0-9]$/.test(v || ''),
        message: 'End with a lowercase letter or number',
    },
    ConsistofLetterNumberUnderscoresOrDot: {
        validate: v => /^[-a-z0-9.]*$/.test(v || ''),
        message: 'Contains only lowercase letters, numbers, and underscores',
    },
    ConsistoLetterNumbersUnderscores: {
        validate: v => /^[a-z0-9-]*$/.test(v || ''),
        message: 'Contains only lowercase letters, numbers, and underscores',
    },
    ConsistoLetterNumbersSplitterDot: {
        validate: v => /^[._a-z0-9-]*$/.test(v || ''),
        message: 'Contains only letters, numbers, dashes, underlines, and dots',
    },
    ConsistofLowercaseLetterNumbersSplitter: {
        validate: v => /^[_\-.a-z0-9]*$/.test(v || ''),
        message: 'Contains only lowercase letters, numbers, and separators',
    },
    ConsistofLowercaseLetterNumbersUnderscores: {
        validate: v => /^[a-z0-9_]*$/.test(v || ''),
        message: 'Contain only lowercase letters, numbers, and underscores',
    },
    ConsistofLetterNumbersUnderscores: {
        validate: v => /^[a-zA-Z0-9_]*$/.test(v || ''),
        message: 'Contains only letters, numbers and underscores',
    },
    ConsistofPath: {
        validate: v => /^[a-zA-Z0-9-_/.]*$/.test(v || ''),
        message: 'Contains only letters, numbers, dashes, underscores, "/" and "."',
    },
    ConsistofGlob: {
        validate: v => isValidGlob(v),
        message: 'Enter log path or glob expression',
    },
    ConsistofSubPath: {
        validate: v => /^[a-zA-Z0-9-_.][a-zA-Z0-9-_/.]*$/.test(v || ''),
        message: 'Please fill in the relative path',
    },
    ConsistofNumber: {
        validate: v => /^[0-9]*$/.test(`${v}` || ''),
        message: 'Contains only numbers',
    },
    ConsistofFloatNumber: {
        validate: v => /^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.test(`${v}` || ''),
        message: 'Number format is wrong',
    },
    ConsistofPercentage: {
        validate: v => /^[0-9]+%$/.test(`${v}` || ''),
        message: 'Contains only percentages',
    },
    ConsistofNumberOrPercentage: {
        validate: v => /^[-+]?[0-9.]+%?$/.test(`${v}` || ''),
        message: 'Contain only percentages or whole numbers',
    },
    ConsistofNormalSymbol: {
        validate: v => /^[\w-.]*$/.test(v || ''),
        message: "Contains only numbers, letters, '-', '_' or '.'",
    },

    numberOrPercentage: {
        validate: v => /^\d+%?$/.test(`${v}` || ''),
        message: 'Contain only numbers or percentages',
    },

    phone: {
        validate: v => /^1([38][0-9]|14[579]|5[^4]|16[6]|7[1-35-8]|9[189])\d{8}$/.test(v || ''),
        message: 'Mobile phone number format is wrong',
    },

    userPassword: {
        validate: v => /(?!^\d+$)(?!^[A-Za-z]+$)(?!^[^A-Za-z0-9]+$)(?!^.*[\u4E00-\u9FA5].*$)^\S{8,20}$/.test(v),
        message: 'The password must contain two or more combinations of letters, numbers and special characters',
    },

    password: {
        validate: v => /^.{5,17}$/.test(v || ''),
        message: 'Begins with a letter, digits 5-17',
    },

    email: {
        validate: v => /^[\w.]+@\w+\.[a-z]{2,3}(\.[a-z]{2,3})?$/.test(v || ''),
        message: 'Email format is wrong',
    },

    ConsistofUnicode: {
        // eslint-disable-next-line
        validate: v => /^[\x00-\x7F]*$/.test(v || ''),
        message: 'Contains only unicode',
    },

    K8SLabelValuePatten: {
        validate: v => /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(v || ''),
        message: 'K8S label is illegal',
    },

    KeyPattern: {
        validate: v => /^([a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*\/)?([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/.test(v),
        message: 'key is illegal',
    },

    noSystemKey: {
        validate: v => !ignoredKeys.some(item => v.startsWith(item)),
        message: 'Cannot use system tags',
    },

    LabelValuePatten: {
        validate: v => /^(([a-zA-Z0-9][a-zA-Z0-9-_]*\.)*[a-zA-Z0-9]*[a-zA-Z0-9-_]*[[a-zA-Z0-9]+\/)?(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(v || ''),
        message: 'Composed of 1-63 letters, numbers, "-", "_" or ".", starting and ending with letters or numbers',
    },

    cidr: {
        validate: v => /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([1-2][0-9]|3[0-2]|[0-9]))$/.test(v || ''),
        message: 'CIDR is illegal',
    },

    ip: {
        validate: v => /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v || ''),
        message: 'IP is illegal',
    },

    dependOnPattern: {
        params: [ 'depend' ],
        validate: (value, { depend }) => {
            if (!depend && depend !== 0) return false;
            return true;
        },
    },

    noRedundance: {
        params: [ 'list' ],
        validate: (value, { list }) => {
            let t = 0;
            list.forEach(p => {
                if (p === value) t++;
            });
            if (t > 1) {
                return false;
            }
            return true;
        },
        message: 'Identical item already exists',
    },

    existence: {
        params: [ 'list' ],
        validate: (value, { list }) => {
            return !list.some(l => l === value);
        },
        message: 'Identical item already exists',
    },

    multipart: {
        params: [ 'rule', 'spliter' ],
        validate: async (value, { rule, spliter }) => {
            const arr = (value || '').split(spliter);
            try {
                const promises = arr.map(p => validate(p, rule));
                const result = await Promise.all(promises);
                return result.every(r => r.valid);
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return rules[params.rule].message;
        },
    },

    lengthBetween: {
        params: [ 'min', 'max' ],
        validate: async (value, { min = -Infinity, max = Infinity }) => {
            try {
                const v = `${value}`.length;
                return v >= min && v <= max;
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return `The length must not be less than ${params.min} position and not greater than ${params.max}.`;
        },
    },

    NumberBiggerThen: {
        params: [ 'min' ],
        validate: async (value, { min = -Infinity }) => {
            try {
                const v = +(value);
                return v > min;
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return `Should be greater than ${params.min}`;
        },
    },

    NumberBetween: {
        params: [ 'min', 'max' ],
        validate: async (value, { min = -Infinity, max = Infinity }) => {
            try {
                const v = +(value);
                return v >= min && v <= max;
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return `The range is between ${params.min}-${params.max}`;
        },
    },
    someRequired: {
        params: [ 'list' ],
        validate: (value, { list }) => {
            return list.some(l => l);
        },
        message: 'Must fill in one',
    },

    someValueRequired: {
        params: [ 'list', 'needed' ],
        validate: (value, { list, needed }) => {
            return list.some(l => l === needed);
        },
        message: 'The workload needs to set up at least one business container',
    },

    sameAs: {
        params: [ 'target', 'key' ],
        validate: (value, { target }) => {
            return value === target;
        },
        message: (field, params) => {
            return `Entered twice ${params.key} inconsistent`;
        },
    },

    linuxCronPattern: {
        validate: value => {
            try {
                cronValidate(value);
                return true;
            } catch (err) {
                return false;
            }
        },
        message: 'Expression is illegal',
    },

    urlpattern: {
        validate: value => {
            try {
                new URL(value);
                return true;
            } catch (err) {
                return false;
            }
        },
        message: 'URL is illegal',
    },

    acceptOne: {
        params: [ 'values' ],
        validate: (value, { values }) => {
            return values.filter(v => v).length === 1;
        },
        message: 'Only one optional option is supported',
    },
    duration: {
        validate: value => /^((([0-9]+)y)?(([0-9]+)w)?(([0-9]+)d)?(([0-9]+)h)?(([0-9]+)m)?(([0-9]+)s)?(([0-9]+)ms)?|0)$/.test(value),
        message: 'Duration is illegal',
    },

    yaml: {
        validate: value => {
            try {
                yamljs.parse(value);
                return true;
            } catch (err) {
                return false;
            }
        },
        message: 'yaml format error',
    },
    validateRemote: {
        params: [ 'service', 'message' ],
        validate: async (value, { service }) => {
            try {
                const response = await service(value);
                return response;
            } catch (error) {
                return false;
            }
        },
        message: (field, params) => {
            return params.message;
        },
    },
    validateCommon: {
        params: [ 'target', 'message' ],
        validate: async (value, { target }) => {
            return !target;
        },
        message: (field, params) => {
            return params.message;
        },
    },
    validateWithRule: {
        params: [ 'target', 'rule' ],
        validate: async (value, { rule, target }) => {
            try {
                return await validate(target, rule);
            } catch (err) {
                return false;
            }
        },
        message: (field, params) => {
            return rules[params.rule].message;
        },
    },
};
