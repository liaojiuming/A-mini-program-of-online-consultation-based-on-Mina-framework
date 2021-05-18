//app.js
App({
  //全局数据
  globalData:{
    hasUserInfo:false,
    userInfo: {},
    openid:null,
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: "你自己的云开发环境",
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  

  
})
