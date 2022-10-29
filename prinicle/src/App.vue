<template>
  <div id="app">
    <a href="/home">home</a>
    <a href="/about">about</a>
    <router-view />
    <router-link to='/home'>test</router-link>
  </div>
</template>

<script>
export default {
  name: "App",
  mounted() {
    // console.log(this.$router);
    // console.log(this.$route);
  },
  methods: {
    
  }
};
</script>

<style>
</style>
