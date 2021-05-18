// miniprogram/pages/mydoctor/mydoctor.js
const app = getApp();
const db = wx.cloud.database();
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo:false,
    myDoctor:[],    //从mydoctor中取出关注过的医生
    index:null,
    noneFlag:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      hasUserInfo:app.globalData.hasUserInfo
    })

    if(that.data.hasUserInfo)
    db.collection("mydoctor").where({
      _openid:app.globalData.openid
    }).get({
      success: function(res) {
        console.log("这是关注的医生信息",res)
        if(res.data.length>0){
          that.setData({
            noneFlag:0,
            myDoctor:res.data
          })
        }
      }
    })
  },



  onShow:function(){
    this.setData({
      hasUserInfo:app.globalData.hasUserInfo
    })
    if(that.data.hasUserInfo)
    db.collection("mydoctor").where({
      _openid:app.globalData.openid
    }).get({
      success: function(res) {
        console.log("这是关注的医生信息",res)
        if(res.data.length>0){
          that.setData({
            noneFlag:0,
            myDoctor:res.data
          })
        }
        else{
          that.setData({
            noneFlag:1,
          })
        }
      }
    })
  },
  //传递相应参数
  doctorInfo()
  {
    console.log("从我的医生里选的",that.data.myDoctor[that.data.index])
    wx.navigateTo({
      url: '../doctorInfo/doctorInfo',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getCartDatalist',that.data.myDoctor[that.data.index].doctorInfo)
      }
     })

  },
  //先获取到选择项
  onChoose(e){
    console.log("onchoose",e)
    that.setData({
      index:e.currentTarget.id,
    })
    console.log("onchoose",e.currentTarget.id)
    that.doctorInfo();
  },

  find(){
    wx.switchTab({
      url: '../main/main'
    })
  },

  login(){
    wx.switchTab({
      url: '../ucenter/index/index'
    })
  }


})