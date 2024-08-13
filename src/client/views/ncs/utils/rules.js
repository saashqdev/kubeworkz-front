// cidrReg cannot pass the judgment of null value
export const cidrReg = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([1-2][0-9]|3[0-2]|[0-9]))$/;

export const cidr = [
    { type: 'string', trigger: 'input', message: '', validator: (rule, value, callback) => ((!value || cidrReg.test(value)) ? callback() : callback(new Error())) },
    { type: 'string', trigger: 'blur', message: 'CIDR is illegal', validator: (rule, value, callback) => ((!value || cidrReg.test(value)) ? callback() : callback(new Error())) },
];
