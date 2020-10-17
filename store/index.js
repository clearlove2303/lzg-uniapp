import Vue from 'vue';
import Vuex from 'vuex';

import jwt from '@/plugins/jwt/core.js';

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    hasLogin: jwt.user() !== null,
  },

  getters: {
    user: () => {
      return jwt.user();
    },
  },

  mutations: {
    login(state, token) {
      state.hasLogin = true;
      jwt.save(token);
      const user = jwt.user();
      uni.$emit('login', user)
    },

    logout(state) {
      jwt.remove();
      uni.removeStorageSync('enrollShowed');
      uni.removeStorageSync('accessToken');
      state.hasLogin = false;
      // finish #2337
    },
  },
})

export default store
