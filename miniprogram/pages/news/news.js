// miniprogram/pages/news/news.js
var that;
var time = require('../../utils/utils.js');
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:null,
    article:{},
    time:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that =this;
    const eventChannel = this.getOpenerEventChannel()   //  取事件对象
    //监听点进的是哪篇文章
    eventChannel.on("getCartDatalist",data=>{  //监听点击的是那一篇文章
      that.setData({
        id:data
      })
      console.log("我被传过来了",that.data.id);
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onReady: function () {
    db.collection("news").where({
      _id:that.data.id
    })
    .get({
      success:function(res){
        console.log("aa",res.data[0])
        that.setData({
          article:res.data[0],
          time:time.formatTime(res.data[0].time,'Y/M/D'),
        })
        console.log("获取了这篇新闻",that.data.article)
        console.log(that.data.time)
      }
    })
  },
 
})