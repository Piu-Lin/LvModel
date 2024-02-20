<template>
  <div id="joystickdom"></div>
</template>
<script setup>
import { LarkSR } from "larksr_websdk";
import {onMounted} from 'vue';

const sdkid="51dfc5ae3eee4301b86a49515f9c3e92"
// const sdkid="JJJJJJJSSS"

 const appid="1202276979286474752"
// const appid="120226474752asdasd"


const emit = defineEmits(["trigger"])

onMounted(()=>{
  let larksr = new LarkSR({
    rootElement: document.getElementById('container'),
    serverAddress: "",
    authCode: sdkid,
    loadingBgUrl: 'https://www.metagis.cc:20241/loadingbg.png',
  });
  larksr.connectWithPxyHost ({
    appliId: appid
  })
  larksr.on('datachanneltext',(e)=>{
    setTimeout(()=>{
      console.log(e.data)
      emit("trigger",e.data)
      },1200)
  })
  window.larksr=larksr
})
</script>
<style scoped>
</style>