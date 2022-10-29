import Vue from 'vue'
import MyRouter from '../plugins/myRouter';
import Home from '../components/home.vue';
import About from '../components/about.vue';

Vue.use(MyRouter);

export default new MyRouter({
  mode: 'history',
  routes:[
    {
      path:'/home',
      component: Home
    },
    {
      path:'/about',
      component: About
    }
  ]
});