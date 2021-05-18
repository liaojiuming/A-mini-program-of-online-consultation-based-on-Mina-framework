// miniprogram/pages/ucenter/tongzhi/messInfo.js
var time = require('../../../utils/utils.js');
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messInfo:{},
    time:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that =this;
    const eventChannel = this.getOpenerEventChannel()   //  取事件对象

    eventChannel.on("getCartDatalist",data=>{  //监听传递的申请信息
      console.log("messInfo>>",data)
      that.setData({
        messInfo:data,
        time:time.formatTime(data.time,'Y/M/D'),    //将时间戳解析为年月日
      })
      console.log("这是申请列表传过来的申请信息",that.data.messInfo)
    });
  },

})