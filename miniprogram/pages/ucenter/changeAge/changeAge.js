// miniprogram/pages/ucenter/changeAge/changeAge.js
const app =getApp();
const db =wx.cloud.database();
Page({

  data: {
    userInfo:{},
  },

  onLoad: function(options) {
    this.setData({
      userInfo: app.userInfo,
    });
  },


  //保存用户输入的信息
  bindFormText:function(e){
    console.log("这是输入值",e.detail.value.age)
    if(e.detail.value.age>0 && e.detail.value.age<100){   //判断输入值是否合法
    db.collection('users').where({
      _openid:app.globalData.openid
    }).update({
      data:{
        age:e.detail.value.age,
      },success:function(){
        wx.showToast({
          title: '修改成功',
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
    if(app.userInfo.isdoctor){    //如果是医生用户，同时修改医生集合中的信息
      db.collection("doctor").where({
        doctorId:app.globalData.openid
      })
      .update({
        data:{
          ['userInfo.age']:e.detail.value.age,
        },  
      })
    }
  }

  else{
    wx.showToast({
      title: '请正确输入',
      icon:'none',
      duration:1000,
      mask:false
    })
  }
   },
})