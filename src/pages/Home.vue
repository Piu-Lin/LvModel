<template>
    <div>
        <Connectpxy @trigger="trigger" />
        <div v-if="isDataLoaded">
        </div>
        <div v-if="LoadComplete">
        </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import sendAssignMessage from "/src/tools/sendAssignMessage.js"
import Connectpxy from '../components/connectpxy.vue'
const deviceInformation = ref([]);
const wsCertified = ref([])
const isDataLoaded = ref(false);
const websc = ref();
let extractedList //发送给像素流的初始状态数据
const WBESOCKETURL2 = 'wss://api.cn2.ilifesmart.com:8443/wsapp/';
let uemeg = reactive({})
let LoadComplete = ref(false)
const trigger = (meg) => {
    LoadComplete.value = true
}
watch(LoadComplete, (N, old) => {
    if(N==true){
        if(isDataLoaded){
            console.log("开始传输初始数据")
            let initialDeviceStateData='{"eventname": "Event_Device_Status","name": "多功能动态感应器","stat": "'+extractedList.find(item => item.name === '多功能动态感应器').stat+'"}'
            sendAssignMessage(initialDeviceStateData)
            initialDeviceStateData='{"eventname": "Event_Device_Status","name": "水浸感应器","stat": "'+extractedList.find(item => item.name === '水浸感应器').stat+'"}'
            sendAssignMessage(initialDeviceStateData)
        }else{
            console.log("数据加载出错")
        }
    }
})

//sendAssignMessage('{"eventname": "Event_Device_Status","name": "多功能动态感应器","stat": "1"}')

onMounted(async () => {
    try { //获取设备信息
        const response = await fetch('http://218.0.59.244:10009/prod-api/open/smartEquipment/getEpGetAll');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        deviceInformation.value = JSON.parse(jsonData.msg).message;
        isDataLoaded.value = true; // 数据加载完成
        //console.log(deviceInformation.value);
        extractedList = deviceInformation.value.map(item => ({
            name: item.name,
            stat: item.stat
        }))

    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
    //console.log(extractedList)
    //console.log()
    try { //获取ws认证信息
        const response = await fetch('http://218.0.59.244:10009/prod-api/open/smartEquipment/getWebSocketSendMsg');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        wsCertified.value = JSON.parse(jsonData.msg)
        //console.log(wsCertified.value)
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }

    //openSocket();
});

function openSocket() {
    if (typeof WebSocket === 'undefined') {
        console.error('This browser does not support WebSocket');
        return;
    }

    const ws = new WebSocket(WBESOCKETURL2);
    websc.value = ws;

    ws.onopen = function (evt) {
        console.log('Connection open ...');
        ws.send(
            JSON.stringify({
                id: wsCertified.value.id,
                method: wsCertified.value.method,
                system: {
                    ver: wsCertified.value.system.ver,
                    lang: wsCertified.value.system.lang,
                    userid: wsCertified.value.system.userid,
                    appkey: wsCertified.value.system.appkey,
                    time: wsCertified.value.system.time,
                    sign: wsCertified.value.system.sign
                }
            })
        );
    };

    ws.onmessage = function (evt) {
        console.log('Received Message: ' + evt);
        let wsResponse = JSON.parse(evt.data)
        if (wsResponse && wsResponse.message !== 'success') {
            console.log(wsResponse.msg)
            console.log(wsResponse.msg.name);
            if (wsResponse.msg.name) {
                let DeviceStateData = '{"eventname": "Event_Device_Status","name": "' + wsResponse.msg.name + '","stat": "' + extractedList.find(item => item.name === wsResponse.msg.name).stat + '"}'
            }
            // 在这里处理收到的消息，根据需要更新设备信息
        }
    };

    ws.onclose = function (evt) {
        console.log('Connection closed.');
    };

    ws.onerror = function () {
        console.error('WebSocket encountered an error');
    };
}
</script>
  