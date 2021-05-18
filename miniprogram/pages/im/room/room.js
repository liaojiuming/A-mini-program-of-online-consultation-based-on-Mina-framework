const app = getApp()

Page({
  data: {
    avatarUrl:'',
    userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
    // chatRoomEnvId: 'release-f8415a',
    chatRoomCollection: 'chat_msg',   //聊天对话数据库
    chatRoomGroupId:null,
    chatRoomGroupName: '',
    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,      //获取openid
    getUser:'',
  },


  onLoad: function(options) {
    wx.pageScrollTo({
      selector: '#end',
      duration: 100
    })
    //设置标题栏为对方名字
    wx.setNavigationBarTitle({
      title: options.name,
    })
    this.setData({
      avatarUrl:  getApp().userInfo.avatarUrl,
      userInfo:  getApp().userInfo,
      chatRoomGroupId:options.groupId,
      getUser:options.getUser,
    })
    this.setData({
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
    })

  },
  onShow(){

  },

  getOpenID: async function() {

    return getApp().globalData.openid

  },

  onGetUserInfo: function(e) {
 this.setData({
      logged: true,
      avatarUrl: getApp().userInfo.avatarUrl,
      userInfo: getApp().userInfo
    })
  

  },

  onShareAppMessage() {
  },

  
})
