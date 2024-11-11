<template>
  <div id="joystickdom"></div>
</template>
<script setup>
import { LarkSR } from "larksr_websdk";
import {onMounted} from 'vue';
const sdkid="a52a5a4996ea4c8c93c9af90e7f9fd16" //  云平台
// const sdkid="4aa090f01f5d430680a6268bdd49dff3" //服务器
// const sdkid="JJJJJJJSSS"
// const appid="1215741834005839872"// 私有化部署appid
const appid="1258742711180066816"// 云id

// const appid="120226474752asdasd"
const emit = defineEmits(["trigger"])
onMounted(()=>{
  let larksr = new LarkSR({
    rootElement: document.getElementById('container'),
    serverAddress: "https://smarthome-model.gtdreamlife.com:18082/",
    authCode: sdkid,
    loadingBgUrl: 'https://www.metagis.cc:20241/loadingbg.png',
  });
  larksr.connectWithPxyHost ({
    appliId: appid
  }) //云平台方式
  // larksr.connect ({
  //   appliId: appid
  // }) //私有化方式
  larksr.on('datachanneltext',(e)=>{
    setTimeout(()=>{
      console.log(e.data)
      emit("trigger",e.data)
      },1200)
  })
  window.larksr=larksr
})
//
</script>
<style scoped>
</style>