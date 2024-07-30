import { make } from 'vuex-pathify';
import userService from 'kubeworkz/services/user';

const state = {
    features: {},
};
const actions = {
    async loadFeature({ commit }) {
        const response = await userService.getFeatures();
        const obj = {};
        Object.keys(response).forEach(k => {
            obj[k] = (response[k] === 'enabled' || response[k] === 'true');
        });
        commit('SET_FEATURES', obj);
    },
};
const mutations = {
    ...make.mutations(state),
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
