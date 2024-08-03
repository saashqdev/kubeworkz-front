import AsyncValidator from 'vusion-async-validator';

// Currently, only validate that supports a single parameter is considered.
export default class Validator {
    /**
     *
     * @param {*} options
     * @param {string} options.key - Corresponding field key
     * @param {array} options.rules - Validation specifications of the corresponding field
     * @memberof Validator
     */
    constructor(options) {
        this.options = options;
        this.validator = this.init(options);
    }
    
    init(options) {
        const { key, rules } = options;
        if(!key || !rules)
            throw new Error('Please enter the corresponding parameters');

        return new AsyncValidator({ [key]: rules });
    }
    // field value, callback function
    validate(value, callback) {
        this.validator.validate({[this.options.key]: value}, { firstFields: true }, callback);
    }
}
