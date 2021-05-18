const app = getApp();
const db = wx.cloud.database();
var that;
Page({
  data: {
    hasUserInfo:false,
    userInfo:{},
    array:['请选择反馈类型', '程序相关', '医生服务', '优惠活动', '功能异常', '产品建议', '投诉医生','其他'],
    index:0,
    type:'无',
    textLength: 0,
  },

  //选择框携带值
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index:e.detail.value
    })

  },
  //监听输入字数
  bindInput(e) {
    that.setData({
      textLength: e.detail.value.length
    })
  },

  //表单提交
  bindFormText:function(e){
    console.log("用户",this.userInfo)
    console.log("这是输入的意见",e.detail.value.opinion)
    console.log("这是输入的电话",e.detail.value.phone)
    if(this.data.index==0)
    {
      wx.showToast({
        title: '请选择反馈类型',
        icon:'none',
        duration:800,
        mask:false
      })
    }
    else if(e.detail.value.opinion.replace(/\s*/g,"").length==0){
      wx.showToast({
        title: '请输入您的意见',
        icon:'none',
        duration:800,
        mask:false
      })
    }   
    else if(e.detail.value.phone.replace(/\s*/g,"").length==0){
      wx.showToast({
        title: '请输入您手机号',
        icon:'none',
        duration:800,
        mask:false
      })
    }
     else{
       db.collection('opinion').add({
      data:{
        type:that.data.array[that.data.index],
        userName:(that.data.userInfo.name?that.data.userInfo.name:that.data.userInfo.nickName),
        opinion:e.detail.value.opinion,
        phone:e.detail.value.phone,
      },
      success:function(){
        wx.showToast({
          title: '成功提交',
          icon:'success',
          duration:1500,
          mask:true
        })
        setTimeout(function(){
          wx.navigateBack({
            delta:0,
          })
        },1500)
      }, 
    })
  }
  },
  onLoad: function () {
    that =this;

    this.setData({
      userInfo: app.userInfo,
      hasUserInfo:app.globalData.hasUserInfo,
    });
    console.log("用户: ",this.data.userInfo);

  },
  onReady: function () {
  },
  onShow: function () {
    that.setData({
      hasUserInfo:app.globalData.hasUserInfo,
     })
        //用户是登录状态
        if(this.data.hasUserInfo){
        }
        //用户非登录状态
        else{
            wx.showToast({
              title: '请先登录',
              icon:'none',
              duration:800,
              mask:false
            })
            setTimeout(function(){
              wx.navigateBack({
                delta:0,
              })
            },800)
          }
  },

})