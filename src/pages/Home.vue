<template>
    <div>
        <div class="HereRoom">
            {{ HereRoomValue }}
        </div>
        <div @click="() => { The23DState = true; sendAssignMessage(SwitchTo3D);HereRoomValue='全屋' }"  class="BackToHome">
            返回全屋视图
        </div>
        <div class="Switch23DBox">
            <!-- @click="()=>{The23DState=false}" -->
            <div v-if="!The23DState" class="The23DBoxChecked">
                2D
            </div>
            <div v-if="!The23DState" @click="() => { The23DState = true; sendAssignMessage(SwitchTo3D);HereRoomValue='全屋' }" class="The23DBox">
                3D
            </div>
            <div v-if="The23DState" @click="() => { The23DState = false; sendAssignMessage(SwitchTo2D) }" class="The23DBox">
                2D
            </div>
            <div v-if="The23DState" class="The23DBoxChecked">
                3D
            </div>
        </div>
    </div>
    <Connectpxy @trigger="trigger" />
    <div v-if="LoadComplete">
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
let The23DState = ref(true);// 2D3D的显示状态
const SwitchTo2D = '{"eventname": "Event_Switch_3D","stat": "0"}' // 改为2d要发送的消息
const SwitchTo3D = '{"eventname": "Event_Switch_3D","stat": "1"}' // 改为3d要发送的消息
const HereRoomValue = ref("全屋")
let extractedList //发送给像素流的初始状态数据
const WBESOCKETURL2 = 'wss://api.cn2.ilifesmart.com:8443/wsapp/';
let uemeg = reactive({})
let LoadComplete = ref(false)
const trigger = (meg) => {
    try { uemeg = JSON.parse(meg) }
    catch (e) { console.log("json格式出错") }
    console.log("已接受的传出消息", uemeg)
    if (uemeg.eventname == "Event_Connected") {
        LoadComplete.value = true
    } else if (uemeg.eventname == "Event_Switch_Room"){
        HereRoomValue.value=uemeg.stat
    }
}
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
        // if(extractedList.value){
        //         extractedList = deviceInformation.value.map(item => ({
        //         name: item.name,
        //         stat: item.stat
        // }))
        // }
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }
    console.log(extractedList)
    try { //获取ws认证信息
        const response = await fetch('http://218.0.59.244:10009/prod-api/open/smartEquipment/getWebSocketSendMsg');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        wsCertified.value = JSON.parse(jsonData.msg)
        console.log(wsCertified.value)
    } catch (error) {
        console.error('Error fetching JSON data:', error);
    }

    openSocket();
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
        // if (wsResponse && wsResponse.message !== 'success') {
        //     console.log(wsResponse.msg)
        //     // console.log(wsResponse.msg.name);
        //     if (wsResponse.msg.name) {
        //         let DeviceStateData = '{"eventname": "Event_Device_Status","name": "' + wsResponse.msg.name + '","stat": "' + extractedList.find(item => item.name === wsResponse.msg.name).stat + '"}'
        //     }
        //     // 在这里处理收到的消息，根据需要更新设备信息
        // }
    };

    ws.onclose = function (evt) {
        console.log('Connection closed.');
    };

    ws.onerror = function () {
        console.error('WebSocket encountered an error');
    };
}
</script>
<style scoped>
.Switch23DBox {
    position: absolute;
    width: 13vw;
    height: 10vh;
    top: 0px;
    right: 0px;
    border-radius: 6px;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
}

.The23DBox {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 5vw;
    height: 8vh;
    border-radius: 6px;
    color :#FFFFFF;
;
}

.The23DBoxChecked {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 5vw;
    height: 8vh;
    background-color: #312d2d;
    border-radius: 6px;
    color: #72EB13;
}

.HereRoom {
    position: absolute;
    width: 8vw;
    height: 6vh;
    top: 0px;
    left: 0px;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    color:#FFFFFF;
}

.BackToHome {
    position: absolute;
    width: 13vw;
    height: 9vh;
    bottom: 0px;
    right: 0px;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #5C5C5C;
    color: #ffffff;
}
</style>