// miniprogram/pages/ucenter/me/me.js
//获取数据库的引用
const db = wx.cloud.database();
const app = getApp();
var that;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    text1Length:0,
    text2Length:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that =this;
    that.setData({
      userInfo:app.userInfo,
    })
  },
    //监听输入字数
    bindInputa(e) {
      that.setData({
        text1Length: e.detail.value.length
      })
    },
    bindInputb(e) {
      that.setData({
        text2Length: e.detail.value.length
      })
    },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  //获取用户信息
  getUser();
    
  },


  //保存用户输入的信息
  bindFormText:function(e){
    console.log("这是输入框1的值",e.detail.value.text1)
    console.log("这是输入框2的值",e.detail.value.text2)
    console.log("这是电话的",e.detail.value.phone)

    db.collection('users').where({
      _openid:that.data.openid
    }).update({
      data:{
        intro:e.detail.value.text1,
        history:e.detail.value.text2,
        phone:e.detail.value.phone
      },
      success:function(){
        wx.showToast({
          title: '保存成功',
          icon:'success',
          duration:1500,
          mask:false
        })
        setTimeout(function(){
          wx.navigateBack({
            delta:0,
          })
        },1500)
      },      
    })
  },


})
function getUser() {
  if (app.globalData.hasUserInfo) { //先判断用户是否为登录状态，解决退出登录后还显示数据的bug
    //通过openid拿到用户全部信息，解决用户修改信息返回后不立即改变的问题
    db.collection("users").where({
      _openid: app.globalData.openid
    }).get({
      success: function (res) {
        console.log("用户信息", res.data[0]);
        that.setData({
          userInfo: res.data[0],
          text1Length: res.data[0].intro.length,
          text2Length: res.data[0].history.length,
        });
      }
    });
  }

  //用户非登录状态
  else {
    wx.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 800,
      mask: false
    });
    setTimeout(function () {
      wx.navigateBack({
        delta: 0,
      });
    }, 800);
  }
}

