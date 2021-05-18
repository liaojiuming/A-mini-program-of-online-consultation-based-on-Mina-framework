// miniprogram/pages/record/record.js

    /**
     * 消息列表
     * 1.建立数据集合：sys_msg
     * icon(对方头像)
     * title(对方昵称)
     * content(最后一条聊天记录)
     * time
     * sendTimeTs
     * userIds(这条消息属于哪个用户)
     * groupId(聊天群组id)
     * unreadCount(未读数)
     * 
     * 2.插入消息集合
     * 发送一条消息成功之后
     *  先查询消息是否存在（groupId userId(对方的id)）
     * 如果能查询到，去更新 
     * content聊天内容
     * time
     * sendTimeTs
     * 查询不倒，去添加
     * icon(对方头像)
     * title(对方昵称)
     * content(最后一条聊天记录)
     * time
     * sendTimeTs
     * userIds(这条消息属于哪个用户)
     * groupId(聊天群组id)
     * 
     * 3.记录页面获取消息列表
     * 并且监听消息列表的更新  监听条件userId是自己
     */
var that;
const db = wx.cloud.database();
const _=db.command;
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo:false,    //用户登录标志
    userInfo:null,    //当前用户
    openid:null,    //当前用户id
    msgList:[],     //问诊记录列表
    noneFlag:1,   //没有问诊记录标志
    watcher:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this;
    that.setData({
      hasUserInfo:app.globalData.hasUserInfo,
      userInfo:app.userInfo,
      openid:app.globalData.openid,
    })
    if(that.data.hasUserInfo){
    that.getMsgList();
    that.data.watcher=1;
    }
  },

  onShow(){
   if(that.data.watcher){}
   else{
    that.setData({
      hasUserInfo:app.globalData.hasUserInfo,
      userInfo:app.userInfo,
      openid:app.globalData.openid,
    })
    if(that.data.hasUserInfo){
    that.getMsgList();
    that.data.watcher=1;
    }
   }

  },

  //获取聊天记录列表
  getMsgList(){
    db.collection("sys_msg")
    .where({
      userIds:_.all([that.data.openid])   //数组包含当前用户
    })
    .orderBy("sendTimeTS","desc")       //按时间降序排序
    .get()
    .then(res=>{
      console.log("get list success",res)
      if(res.data.length>0){
        for(var i=0; i<res.data.length; ++i)
        {
          var msg = res.data[i]
          if(msg.type==1){
            msg = that.show(msg);     //模仿微信聊天格式，列表始终展示对方头像和昵称
          }
        }
        that.setData({
          noneFlag:0,
          msgList:res.data
        })
      }
      that.getUnreadCount()   //获取未读数
      that.initWatch()    //监听消息列表
    })
    .catch(err=>{
      console.log("get list fail",err)
    })
  },

  //监听列表更新
  initWatch(){ 
    var timeTS = Date.now();    //默认为当前时间
    if(that.data.msgList.length>0){     //如果消息列表中有数据
      timeTS = that.data.msgList[0].sendTimeTS;
    }
    console.log("启动消息列表监听",timeTS)
    db.collection("sys_msg")
    .where({
      userIds:_.all([that.data.openid]),  //数组包含当前用户
      sendTimeTS:_.gt(timeTS)         //最新的事件
    })//发起监听
    .watch({
      onChange: function(snapshot){
        console.log("snapshot",snapshot)
        const msgs = [...that.data.msgList]
        for(const docChange of snapshot.docChanges){
          switch(docChange.dataType){
            case 'add':             //监听插入和更新操作
            case 'update':{
              const ind = msgs.findIndex(msg =>msg._id === docChange.doc._id) //查询消息列表中是否有监听到的消息
          
          //显示对方的头像和昵称
          var msg = docChange.doc
          msg=that.show(msg);     //模仿微信聊天格式，列表始终展示对方头像和昵称

              if(ind > -1){
                msg.unreadCount = msgs[ind].unreadCount
                msgs.splice(ind, 1, msg)  //有这条消息则更新
              }
              else{
                if(msg.users[0]._openid==that.data.openid){}//第一条消息发送方
                else{msg.unreadCount=1}
                msgs.push(msg)      //没有则插入
              }

              if(that.data.noneFlag){
                that.setData({
                  noneFlag:0
                })
              }
              break
            }
          }
        }
        that.setData({      
          //新消息靠前显示
          msgList: msgs.sort((x,y)=>y.sendTimeTS - x.sendTimeTS)
        })
      },
      onError: function(err){
        console.error('that watch closed because of error',err)
      }
    })
  },


  //显示对方信息
  show(msg){
    var icon = "";
    var title = "";
    if(msg.users[0]._openid==that.data.openid)    //当前用户是数组中的第一个，则显示第二个的头像名称
    {
      icon = msg.users[1].avatarUrl;
      title = (msg.users[1].name?msg.users[1].name:msg.users[1].nickName);
    }
    else{
      icon = msg.users[0].avatarUrl;
      title = (msg.users[0].name?msg.users[0].name:msg.users[0].nickName);
    }
    msg.icon=icon,
    msg.title=title

    return msg
  },

  //获取未读消息条数列表和未读消息条数列表监听
  getUnreadCount(){
    db.collection("unread_count")
    .where({
      userId:that.data.openid,
      count:_.neq(0)      //count不为0
    })
    .get()
    .then(res=>{
      console.log("getUnreadCount",res)
      if(res.data.length > 0){
        const msgs = [...that.data.msgList]
        for(var i = 0; i<res.data.length; ++i){
          var item = res.data[i];
          var ind = msgs.findIndex(msg=>msg.groupId===item.groupId)
          if(ind > -1){
            msgs[ind].unreadCount = item.count;
          }
        }
        that.setData({
          msgList: msgs.sort((x,y)=>y.sendTimeTS-x.sendTimeTS)
        })
       }
       that.initWatchUnreadCount();    //调用监听未读数方法
    })
  },

  initWatchUnreadCount(){
    var timeTS = Date.now();
    if(that.data.msgList.length>0){
      timeTS = that.data.msgList[0].sendTimeTS;
    }
    console.log("启动未读数监听",timeTS)
    db.collection("unread_count")
    .where({
      userId:that.data.openid,  //数组包含当前用户
      sendTimeTS:_.gt(timeTS)         //最新的事件
    })//发起监听
    .watch({
      onChange: function(snapshot){
        console.log("接收到未读数监听",snapshot)
        const msgs = [...that.data.msgList]
        for(const docChange of snapshot.docChanges){
          switch(docChange.dataType){
            case 'add':
            case 'update':
              {
                const ind = msgs.findIndex(msg =>msg.groupId === docChange.doc.groupId)
                if(ind > -1){
                  msgs[ind].unreadCount=docChange.doc.count
                }
                break
              }
          }
        }
        that.setData({
          msgList: msgs.sort((x,y)=>y.sendTimeTS-x.sendTimeTS)
        })
        //统计当前用户消息未读数显示在TabBar上
        db.collection("unread_count")
        .where({
          userId:that.data.openid,
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
            else{
              //tabbar未读数清零
              wx.removeTabBarBadge({
                index: 2
              })
            }
          }
        })
      },
      onError: function(err){
        console.error('that watch closed because of error',err)
      }
    })
  },


//跳登录页面
  login(){
    wx.switchTab({
      url: '../ucenter/index/index'
    })
  },

//点击消息列表项，进入聊天室
  clickMsg(e){
    var index = e.currentTarget.dataset.index;
    console.log("index",index)
    var msg = that.data.msgList[index];
    var getUserId=(msg.userIds[0]==that.data.openid?msg.userIds[1]:msg.userIds[0]);//非当前用户：消息接收方

    console.log("msg",msg)
    wx.navigateTo({
      url: '../im/room/room?name='+msg.title+'&groupId='+msg.groupId+'&getUser='+getUserId,
    })
  },

})
