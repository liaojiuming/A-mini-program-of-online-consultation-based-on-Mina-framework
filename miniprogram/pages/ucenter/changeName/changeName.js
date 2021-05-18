// miniprogram/pages/ucenter/changeName/changeName.js
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
    console.log("这是输入值",e.detail.value.name)
    if(e.detail.value.name.replace(/\s*/g,"").length!=0){   //阻止空字符串非法输入
    db.collection('users').where({      //更新该用户用户集合下的姓名
      _openid:app.globalData.openid
    }).update({
      data:{
        name:e.detail.value.name,
      },
      success:function(){
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
    /**
     * author: jmliao
     * date:   2021-5-2
     * 修改内容：增加医生用户判断，解决医生用户修改姓名后医生集合中数据没有修改的问题
     */
    if(app.userInfo.isdoctor){    //如果是医生用户，同时修改医生集合中的信息
      db.collection("doctor").where({
        doctorId:app.globalData.openid
      })
      .update({
        data:{
          name:e.detail.value.name,
          ['userInfo.name']:e.detail.value.name,
        }
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