<template>
  <div id="joystickdom"></div>
</template>
<script setup>
import { LarkSR } from "larksr_websdk";
import {onMounted} from 'vue';
// const sdkid="69ab8e9895d845188426101ea8924623" //  云平台
const sdkid="88f24368aae04417bb3c58d1741aeffb" //服务器
// c81f505a1c4e4fd18e456fbc380b7778
// const sdkid="JJJJJJJSSS"
const appid="1215741834005839872"// 私有化部署sdk
// const appid="120226474752asdasd"
const emit = defineEmits(["trigger"])
onMounted(()=>{
  let larksr = new LarkSR({
    rootElement: document.getElementById('container'),
    serverAddress: "172.16.104.107:8181",
    authCode: sdkid,
    loadingBgUrl: 'https://www.metagis.cc:20241/loadingbg.png',
  });
  // larksr.connectWithPxyHost ({
  //   appliId: appid
  // }) 云平台方式
  larksr.connect ({
    appliId: appid
  }) //私有化方式
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