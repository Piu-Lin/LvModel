<template>
  <div>
    <div class="HereRoom">
      {{ HereRoomValue }}
    </div>
    <div
      @click="
        () => {
          The23DState = true;
          sendAssignMessage(SwitchTo3D);
          HereRoomValue = '全屋';
        }
      "
      class="BackToHome"
    >
      <span v-if="HereRoomValue == '全屋'">返回默认视角</span>
      <span v-if="HereRoomValue != '全屋'">返回全屋视图</span>
    </div>
    <div class="Switch23DBox">
      <!-- @click="()=>{The23DState=false}" -->
      <div v-if="!The23DState" class="The23DBoxChecked">2D</div>
      <div
        v-if="!The23DState"
        @click="
          () => {
            The23DState = true;
            sendAssignMessage(SwitchTo3D);
            HereRoomValue = '全屋';
          }
        "
        class="The23DBox"
      >
        <span class="sbpm">3D</span>
      </div>
      <div
        v-if="The23DState"
        @click="
          () => {
            The23DState = false;
            sendAssignMessage(SwitchTo2D);
          }
        "
        class="The23DBox"
      >
        2D
      </div>
      <div v-if="The23DState" class="The23DBoxChecked">
        <span class="sbpm">3D</span>
      </div>
    </div>   
  </div>
  <Connectpxy @trigger="trigger" />
  <div v-if="LoadComplete"></div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from "vue";
import sendAssignMessage from "/src/tools/sendAssignMessage.js";
import Connectpxy from "../components/connectpxy.vue";
const deviceInformation = ref([]);
const wsCertified = ref([]);
const isDataLoaded = ref(false);
const websc = ref();
let The23DState = ref(true); // 2D3D的显示状态

const SwitchTo2D = '{"eventname": "Event_Switch_3D","stat": "0"}'; // 改为2d要发送的消息
const SwitchTo3D = '{"eventname": "Event_Switch_3D","stat": "1"}'; // 改为3d要发送的消息

const HereRoomValue = ref("全屋");
let extractedList; //发送给像素流的初始状态数据
const WBESOCKETURL2 = "wss://api.cn2.ilifesmart.com:8443/wsapp/";
let uemeg = reactive({});
let LoadComplete = ref(false);
const trigger = (meg) => {
  try {
    uemeg = JSON.parse(meg);
  } catch (e) {
    console.log("json格式出错");
  }
  console.log("已接受的传出消息", uemeg);
  if (uemeg.eventname == "Event_Connected") {
    LoadComplete.value = true;
  } else if (uemeg.eventname == "Event_Switch_Room") {
    HereRoomValue.value = uemeg.stat;
  }
};
onMounted(async () => {
  try {
    //获取设备信息
    const response = await fetch(
      "https://metagis.cc:20256/prod-api/open/smartEquipment/getEpGetAll"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const jsonData = await response.json();
    // console.log(jsonData.msg)
    deviceInformation.value = JSON.parse(jsonData.msg).message;
    // deviceInformation.value = jsonData
    isDataLoaded.value = true; // 数据加载完成
    // console.log(deviceInformation.value);

    extractedList = deviceInformation.value.map((item) => ({
      name: item.name,
      fullCls: item.fullCls,
      stat: item.stat,
      data: item.data,
      image:item.image,
      agtme: item.agt + item.me,
    }));
    // console.log("eee=========>>>>",extractedList);
  } catch (error) {
    console.error("Error fetching JSON data:", error);
  }
  setTimeout(() => {
      extractedList.map(item => {
      DetermineState(item)
  })
  }, 18000);
  try {
    //获取ws认证信息
    const response = await fetch(
      "https://metagis.cc:20256/prod-api/open/smartEquipment/getWebSocketSendMsg"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const jsonData = await response.json();
    wsCertified.value = JSON.parse(jsonData.msg);
    // console.log(wsCertified.value)
  } catch (error) {
    console.error("Error fetching JSON data:", error);
  }
  openSocket();
});

// 根据数据判断发送所需状态
function DetermineState(deviceData) {
  let statstring;
  if (deviceData && deviceData.stat == 1) {
    statstring = "未启动";
  } else if (deviceData.stat == 2) {
    statstring = "运行中";
  } else if (deviceData.stat == 3) {
    statstring = "告警";
  } else {
    statstring = "异常";
  }
  let assignMessage =
    '{"eventname": "Event_Device_Status","name": "' +
    deviceData.name +
    '","stat": "' +
    deviceData.stat +
    '","statstring": "' +
    statstring +
    '","currentname": "' +
    deviceData.name +
    '","image": "' +
    deviceData.image +
    '"}';
  sendAssignMessage(assignMessage);
}

function openSocket() {
  if (typeof WebSocket === "undefined") {
    console.error("This browser does not support WebSocket");
    return;
  }

  const ws = new WebSocket(WBESOCKETURL2);
  websc.value = ws;

  ws.onopen = function (evt) {
    console.log("Connection open ...");
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
          sign: wsCertified.value.system.sign,
        },
      })
    );
  };

  ws.onmessage = function (evt) {
    console.log("Received Message: " + evt);
    let wsResponse = JSON.parse(evt.data);
    console.log("所接受到的单个消息为：",wsResponse);
    if (wsResponse && wsResponse.message !== "success") {
      let DeviceStateData;
      let resOutName = extractedList.find(
        (item) => item.agtme == wsResponse.msg.agt + wsResponse.msg.me
      ).name;
      let stateAndIMG;
      if (wsResponse.msg) {
        fetch("https://metagis.cc:20256/prod-api/open/smartEquipment/getStat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(wsResponse.msg),
        })
          .then((response) => {
            // 检查响应是否成功
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            // 解析JSON格式的响应数据
            return response.json();
          })
          .then((data) => {
            // 处理返回的数据
            stateAndIMG=data.data
            let statstring;
            console.log("查询后对应的名称为：",resOutName,"\n后端给出的状态以及图片id为：",stateAndIMG)
            if (stateAndIMG && stateAndIMG.stat == 1) {
                statstring = "未启动";
            } else if (stateAndIMG.stat == 2) {
                statstring = "运行中";
            } else if (stateAndIMG.stat == 3) {
                statstring = "告警";
            } else {
                statstring = "异常";
            }
            if (resOutName && stateAndIMG.stat!="-1") {
                DeviceStateData =
                // '{"eventname": "Event_Device_Status","name": "' +resOutName +'","stat": "' + defalstat + ',"statstring": "'+statstring+'","currentname":"'+statstring+'"}';
                '{"eventname": "Event_Device_Status","name": "' +
                resOutName +
                '","stat": "' +
                stateAndIMG.stat +
                '","statstring": "' +
                statstring +
                '","currentname": "' +
                resOutName +
                '","image": "' +
                stateAndIMG.image +
                '"}';
                //console.log("需要发的数据：",DeviceStateData)
                sendAssignMessage(DeviceStateData);
            }
          })
          .catch((error) => {
            // 处理错误
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
          });
      }

      
    }
  };

  ws.onclose = function (evt) {
    console.log("Connection closed.");
  };

  ws.onerror = function () {
    console.error("WebSocket encountered an error");
  };
}
</script>
<style scoped>
.Switch23DBox {
  position: absolute;
  width: 109px;
  height: 32px;
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
  width: 54px;
  height: 32px;
  border-radius: 6px;
  color: #ffffff;
}

.The23DBoxChecked {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 54px;
  height: 32px;
  background-color: #312d2d;
  border-radius: 6px;
  color: #72eb13;
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
  color: #ffffff;
}

.BackToHome {
  position: absolute;
  width: 15vw;
  height: 9vh;
  bottom: 0px;
  right: 0px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16.8px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: #5c5c5c; */
  background-color: #7f7f7f;

  color: #ffffff;
}

@font-face {
  font-family: "myFont";
  src: url("/assets/PingFang_Medium.otf");
  font-weight: normal;
  font-style: normal;
}

html,
body {
  font-family: myFont, sans-serif;
}
.sbpm {
  font-weight: 500;
  font-size: 16px;
}
</style>
