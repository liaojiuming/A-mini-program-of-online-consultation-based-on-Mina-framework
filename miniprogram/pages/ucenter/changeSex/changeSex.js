// miniprogram/pages/ucenter/changeSex/changeSex.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['null', '男', '女',],
    index:0,
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index:e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  },


  dosub(){
    db.collection("users").where({
      _openid:app.globalData.openid
    }).update({
      data:{
        gender:this.data.array[this.data.index],
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
    if(app.userInfo.isdoctor){
      db.collection("doctor")
      .where({
        doctorId:app.globalData.openid
      })
      .update({
        data:{
          ['userInfo.gender']:this.data.array[this.data.index],
        }
      })
    }
  }
})