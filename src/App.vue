<script setup>

import Home from './pages/Home.vue'
</script>

<template>
  <div >
    <div id="container"></div>
    <Home/>
  </div>
</template>

<style scoped>

@font-face {
    font-family: 'myFont'; 
    src: url('/assets/PingFang_Medium.otf'); 
    font-weight: normal;
    font-style: normal;
  }

html,body { 
  font-family: myFont, sans-serif; 
}
</style>
