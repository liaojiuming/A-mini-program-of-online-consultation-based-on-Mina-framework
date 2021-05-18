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
        env: "xiaoming-8ggyufqu62224b90",
        traceUser: true,
      })
    }

    this.globalData = {}
  },
  

  
})
