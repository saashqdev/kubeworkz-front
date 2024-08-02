<template>
    <u-modal @close="close" title="Personal information" ok-button="" cancel-button="" :visible.sync="show" size="huge">
        <u-form gap="large" :rules="rules" @validate="formValid = $event.valid">
            <u-form-item name="accountId" label="Account number" required>
                {{ model.AccountId }}
            </u-form-item>
            <u-form-item name="name" label="User's Nickname" placement="bottom">
                <u-input size="large huge" v-model="model.UserName" maxlength="64" maxlength-message="Must not exceed 64 characters"></u-input>
            </u-form-item>
            <u-form-item name="phone" label="Cell phone" placement="bottom">
                <u-input size="large huge" v-model="model.Phone" maxlength="11"></u-input>
            </u-form-item>
            <u-form-item name="email" label="EMail" placement="bottom">
                <u-input size="large huge" v-model="model.Email"></u-input>
            </u-form-item>
            <u-submit-button :click="submit.bind(this)" place="middle">
                <template slot-scope="scope">
                    <u-linear-layout>
                        <u-button color="primary" @click="scope.submit" :disabled="!formValid || scope.submitting" :icon="scope.submitting ? 'loading' : ''">OK</u-button>
                        <u-button @click="close">Cancel</u-button>
                    </u-linear-layout>
                </template>
            </u-submit-button>
        </u-form>
    </u-modal>
</template>

<script>
import { Modal } from '@micro-app/common/base/mixins';
import permissionService from '@micro-app/common/services/platform';
import cookie from '@micro-app/common/utils/handleCookie';
import _ from 'lodash';
export default {
    name: 'u-user-info-modal',
    mixins: [Modal],
    data() {
        return {
            model: {
                AccountId: '',
                UserName: '',
                Phone: '',
                Email: '',
            },
            rules: {
                phone: [
                    { type: 'string', pattern: /.{10,}/, trigger: 'input+blur', message: 'Please enter your 10-digit mobile phone number' },
                ],
                email: [
                    { type: 'string', pattern: /[.a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+/, trigger: 'input+blur', message: 'Please enter the correct email format' },
                ],
            },
            formValid: false,
        };
    },
    watch: {
        show(val) {
            val && this.getUser();
        },
    },
    methods: {
        getUser() {
            permissionService.getUser({
                AccountId: cookie.readCookie('accountId'),
            }).then((info) => {
                this.model = _.pick(info, _.keys(this.model));
            });
        },
        submit() {
            return permissionService.updateUserInfo(_.omit(this.model, ['AccountId'])).then(() => {
                this.$emit('update', this.model);
                this.close();
            });
        },
    },
};
</script>
