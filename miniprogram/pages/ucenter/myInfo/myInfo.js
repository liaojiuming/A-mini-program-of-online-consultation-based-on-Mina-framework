// miniprogram/pages/ucenter/myInfo/myInfo.js

const app = getApp();
const db = wx.cloud.database();
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
  },

  onLoad:function(){
    that=this
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    //通过openid拿到用户全部信息，解决用户修改信息返回后不立即改变的问题
      db.collection("users").where({
        _openid:app.globalData.openid
      }).get({
        success:function(res){
          console.log("用户信息",res.data[0])
          that.setData({
            userInfo:res.data[0],
          })
          app.userInfo=that.data.userInfo;
        }
      })

  },

  showmsg(){
    wx.showToast({
      title: '暂不支持修改头像',
      icon:'none',
      duration:1500,
      mask:false
    })
  }


})