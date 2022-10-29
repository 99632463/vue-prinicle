import Vue from 'vue';
import myVuex from '../plugins/myVuex';

Vue.use(myVuex)

export default new myVuex.Store({
  state: {
    name: 'wangkai'
  },
  mutations: {
    test(state, name){
      state.name = name;
    }
  },
  actions:{
    myAction({ commit }, name){
      setTimeout(() => {
        commit('test', name);
      },1000)
    }
  }
});