// miniprogram/pages/doctorInfo/doctorInfo.js
/**
 * author： jmliao
 * date:    2021-4-25
 * 显示医生信息，将科室转化为中文显示
 * 判断是否关注过该医生，是则显示已经关注按钮，否则显示关注按钮
 * 点击关注按钮，将医生信息添加到mydoctor集合下，医生star+1
 * 点击已关注按钮，提示是否取消关注，是则将关注数据删除，医生star-1
 */
const db = wx.cloud.database();
const _ = db.command;
const app = getApp();
var that;
Page({

  data: {
    doctorInfo:{},    //接受传过来的医生信息
    userInfo:{},    //接受医生信息下的用户信息
    items:[],       //科室信息
    depart:[],    //医生擅长的科室
    flag:true,      //flag为true表示可以关注
  },

  onLoad: function(options){
    that =this;

    const eventChannel = this.getOpenerEventChannel()   //  取事件对象

    eventChannel.on("getCartDatalist",data=>{  //监听传递医生信息
      console.log(">>",data)
      that.setData({
        doctorInfo:data,
        userInfo:data.userInfo,   //方便显示一些数据
      })
      console.log("这是传过来的医生信息",that.data.doctorInfo)
      /**
       * author: jmliao
       * date:  2021-4-29
       * 解决真机调试关注按钮显示出错问题
       * 原因：在真机调试过程中，eventChannel监听方法和方法外的外部代码之间未按顺序执行
       */
      //console.log("88888888",that.data.doctorInfo.doctorId)
      db.collection("mydoctor").where({   //获取用户对该医生的关注情况
        _openid:app.globalData.openid,   //关注人为当前用户
        doctorId:that.data.doctorInfo.doctorId  //且医生为该页面显示的医生
      })
      .get()
      .then(res=>{
        //console.log("9999999",res.data)
        if(res.data.length==0){
         that.setData({
           flag:true    //如果没有关注过该医生，将关注标志打开
         })
        }
        else if(res.data.length==1){      //之前关注过就关闭关注标志
          that.setData({
            flag:false
          })
         }
      })
    }
    );

    db.collection("department").get({   //通过数据库获取科室信息
      success:function(res){
        that.setData({
          items:res.data,
        })
        that.change()   //将科室代码转换为汉字
      }
    });

  },

  onShow(){
   
  },

  //读取信息中的科室转换为汉字显示在页面上
  change(){
    for(var i=0; i<that.data.doctorInfo.department.length;++i){
      for(var j=0; j<that.data.items.length;++j)
      {
        if(that.data.doctorInfo.department[i]===that.data.items[j]._id)
        {
          that.data.depart.push(that.data.items[j].depart)
        }
      }
    }
    console.log("擅长这些科室",that.data.depart)
    this.setData({
      depart:that.data.depart
    })
  },

  //关注医生
  star(){
    if(that.data.doctorInfo)    //解决医生信息未加载完成便点击关注造成的bug
    {that.setData({
      flag:false,
    });
    db.collection("mydoctor").add({
      data:{
        doctorId:that.data.doctorInfo.doctorId,
        doctorInfo:that.data.doctorInfo,
      }
    }).then(res => {      //添加关注成功
      console.log(res);
      wx.showToast({
        title: '关注成功',
        icon:'success',
        duration:1500,
        mask:false
      })
      that.addStar()      //增加关注量
    }) .catch(error=>{   //添加失败
      wx.showToast({
        title: '关注失败，请重试',
        icon:'none',
        duration:1000,
        mask:false
      })
    })
  }
  else{
    wx.showToast({
      title: '请稍后再试',
      icon:'none',
      duration:1500,
      mask:false
    })
  }
  },

  nostar(){
    if(that.data.doctorInfo)
    {wx.showModal({    //取消关注前先询问
      title: '',
      confirmColor: '#b4282d',
      content: '确认取消关注？',
      success:(res)=> {
        if (res.confirm) {
          db.collection("mydoctor").where({
            doctorId:that.data.doctorInfo.doctorId,      //将该医生从关注劣币啊删除
          }).remove()
          .then(res=>{                        //删除数据后，提示成功
            console.log(res);
            wx.showToast({
              title: '取消关注成功',
              icon:'success',
              duration:1500,
              mask:false
            })
            that.setData({                  //同时改变关注标志
              flag:true,
            })
            that.subStar()    //减少关注量
          })
          .catch(error=>{   //失败
            wx.showToast({
              title: '取消关注失败，请重试',
              icon:'none',
              duration:1000,
              mask:false
            })
          })

        }
      }
    })
  }
  else{
    wx.showToast({
      title: '请稍后再试',
      icon:'none',
      duration:1500,
      mask:false
    })
  }
  },
  addStar(){      //添加关注量
    db.collection("doctor").where({
      doctorId:that.data.userInfo._openid
    })
    .update({
      data:{
        star: _.inc(1)      //star字段自增1
      },uccess: function(res) {
        console.log("addStar",res.data)
      }
    })
  },
  subStar(){    //减少关注量
    db.collection("doctor").where({
      doctorId:that.data.userInfo._openid
    })
    .update({
      data:{
        star: _.inc(-1)      //star字段自增-1
      },uccess: function(res) {
        console.log("subStar",res.data)
      }
    })
  },
/**
 * 用户向医生发起咨询的入口
 */
  chat(){
    if(that.data.doctorInfo){   //防止医生信息未加载完毕引发的bug
    var currentId = app.globalData.openid   //当前用户id
    var doctorId = that.data.doctorInfo.doctorId   //该页面的医生id
    console.log("01",currentId)
    console.log("02",doctorId)
    //禁止向自己发起咨询
    if(currentId==doctorId){
      wx.showToast({
        title: '不可以向自己咨询哦！',
        icon:'none',
        duration:1500,
        mask:false
      })
      setTimeout(function(){
        wx.navigateBack({
          delta:0,
        })
      },1500)
      return;
    }
    else{    //查询和医生之间是否存在对话，如果存在直接进入聊天，不存在则创建
    db.collection("chat_group").where({
      type:1,   //医患单独对话
      chat_members:_.all([currentId,doctorId])    //聊天成员包括当前用户和该医生
    })
    .get()
    .then(res=>{
      console.log("搜索对话记录成功",res)
      if(res.data.length==0){   //不存在对话，创建聊天
        db.collection("chat_group")
        .add({
            data:{
              type:1,
              chat_members:[currentId,doctorId],
              time:new Date()
            }
          })
          .then(e=>{
            console.log("创建聊天成功",e)
            wx.navigateTo({                     //跳转到创建的聊天室页面，标题为医生的姓名或昵称，
              url: '../im/room/room?name='+(that.data.userInfo.name ? that.data.userInfo.name :that.data.userInfo.nickName)+'&groupId='+e._id+'&getUser='+doctorId,
            })
          })
          .catch(err=>{
            console.log("创建聊天失败",err)
          })
      }
      else{                     //存在对话，直接打开
        wx.navigateTo({                     //跳转到创建的聊天室页面，标题为医生的姓名或昵称，
          url: '../im/room/room?name='+(that.data.userInfo.name ? that.data.userInfo.name :that.data.userInfo.nickName)+'&groupId='+res.data[0]._id+'&getUser='+doctorId,
        })
      }
    })
    .catch(err=>{
      console.log("查询对话记录失败失败",err)
    })
  }}
  else{
    wx.showToast({
      title: '请稍后再试',
      icon:'none',
      duration:1500,
      mask:false
    })
  }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})