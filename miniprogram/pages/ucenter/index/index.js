const app = getApp();
const db = wx.cloud.database();
var that;
Page({
  data: {
    userInfo: {},
    openid:'',
    hasUserInfo: false,
    oneButton: [{text: '微信授权登录'}],
  },
  onLoad: function() {
    that=this
    // 页面初始化 options为页面跳转所带来的参数
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  onShow: function() {
    that.setData({
      userInfo:app.userInfo
    })
  },

  onUserInfoClick: function() {
    if (this.userInfo) {
      
    } else {
      this.showLoginDialog();       //点击信息栏弹出登录对话框
    }
  },

  showLoginDialog() {
    this.setData({
      showLoginDialog: true
    })
  },

  onCloseLoginDialog () {
    this.setData({
      showLoginDialog: false
    })
  },


  getUserProfile(e) {
    wx.getUserProfile({     //调用接口获取微信用户基本信息
      lang:"zh_CN",
      desc:"正在获取",
      success:(res)=>{
        console.log('获取成功: ',res)
        //将性别代码进行转换
        switch (res.userInfo.gender) {
          case 0:
            res.userInfo.gender='未知'
            break
          case 1:
            res.userInfo.gender='男'
            break
          case 2:
            res.userInfo.gender='女'
            break
        }

        this.setData({
          showLoginDialog: false,
          hasUserInfo: true
        });
        app.globalData.hasUserInfo=true,
        //执行添加用户
        that.addUser(res.userInfo);
        //拿到用户全部信息
        that.getUser();
      },
      fail:function(err){
        console.log("获取失败: ",err)
      }
    })
  },

  //在云函数中调用方法存储用户信息到数据库
  addUser(userInfo){
    wx.cloud.callFunction({
      name:'login',
      data:userInfo,
    }).then(res=>{
      console.log('callFunction success',res)
    })
  },

  
  //通过调用云函数拿到openid
  getUser(){
    wx.cloud.callFunction({
      name:'getUserInfo',
    }).then(res=>{
      that.setData({
        openid:res.result.openid,
      })
      console.log("拿到openid了",res.result.openid)
      that.getInfo()
    })
  },

  //通过openid拿到用户全部信息
  getInfo(){
    db.collection("users").where({
      _openid:that.data.openid
    }).get({
      success:function(res){
        console.log("是否为管理员",res.data[0].isadmin)
        that.setData({
          userInfo:res.data[0],
        })
        app.userInfo=that.data.userInfo;
        app.globalData.openid=that.data.openid;

          //统计当前用户消息未读数显示在TabBar上
          db.collection("unread_count")
          .where({
            userId:that.data.openid,  //数组包含当前用户
          })
          .get()
          .then(res=>{
            if(res.data.length>0)
            {
              var counts=0
              for(var i=0;i<res.data.length;i++){   //统计未读数
                counts=counts+res.data[i].count
              }
  
              if(counts>0)    //如果有未读消息显示在TabBar上
              {
                wx.setTabBarBadge({
                  index: 2,
                  text: String(counts)
                })
              }
            }
          })
      }
    })
  },


  // 退出登录
  exitLogin: function() {
    wx.showModal({
      title: '',
      confirmColor: '#b4282d',
      content: '退出登录？',
      //确认退出后清理登录数据
      success:(res)=> {
        if (res.confirm) {
          this.setData({
            showLoginDialog:false,
            userInfo: {},
            hasUserInfo: false,
            canIUseGetUserProfile: true,
          })
          app.userInfo={};
          app.globalData.openid=null;
          app.globalData.hasUserInfo=false;

          //tabbar未读数清零
          wx.removeTabBarBadge({
            index: 2
          })
        }
      }
    })

  },

  myInfo(){
    let that=this
    wx.navigateTo({
      url: '../myInfo/myInfo',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getCartDatalist1',that.data.openid)  //触发事件
      }
     })

  },

  //跳转到个人信息页面
  personal(){
    wx.navigateTo({
      url: '../me/me',
     })
  },

  //跳转到意见反馈页面
  toOpinion(){
    let that=this
    wx.navigateTo({
      url: '../opinion/opinion',
     })
  },

  //成为医生
  tobeDoctor(){
    let that=this
    wx.navigateTo({
      url: '../bedoctor/bedoctor',    
     })
  },

    //查看通知
    toTongzhi(){
      wx.navigateTo({
        url: '../tongzhi/tongzhi',
       })
    },
    //医生信息设置
    aboutDoctor(){
      wx.navigateTo({
        url: '../aboutdoctor/aboutdoctor',
       })
    },
    
  //管理申请信息
  applyList(){
    wx.navigateTo({
      url: '../applyList/applyList',
     })
  }
  
})