/** 
 * @param longitude 经度
 * @param latitude 纬度
 * @param locatioName 位置名
 * @param address 位置详细说明
 * @description 调用微信地图以及导航API
 * */
export default function showLocation  (longitude,latitude,locatioName,address) {
    console.log("已调用导航方法")
    wx.openLocation({
        longitude, // 经度，浮点数，范围为180 ~ -180。
        latitude, // 纬度，浮点数，范围为90 ~ -90
        name:locatioName, // 位置名
        address, // 地址详情说明
        scale: 20, // 地图缩放级别,整型值,范围从1~28。默认为最大
    });
    console.log("调用结束")

}