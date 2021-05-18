
/**
 * 同意操作：->将申请人的信息写入医生集合->将申请人用户集合中的isdoctor字段设为true->删除申请信息->发送通知
 * 拒绝操作：->删除申请信息->发送通知
 */
const app = getApp();
const db = wx.cloud.database();
var that;
Page({

  data: {
    applyinfo:{},
    show:false,   //用于控制图片浏览器是否显示
  },

  onLoad: function(){
      that =this;
      const eventChannel = this.getOpenerEventChannel()   //  取事件对象
  
      eventChannel.on("getCartDatalist",data=>{  //监听传递的申请信息
        console.log(">>",data)
        that.setData({
          applyinfo:data,
        })
        console.log("这是申请列表传过来的申请信息",that.data.applyinfo)
      });
    },

  change(e) {
      console.log('current index has changed', e.detail)
    },
//隐藏图片浏览器
  hide() {
      console.log('component hide')
          this.setData({
              show: false
          })
  },
//打开图片浏览器
  show() {
    console.log('component show')
        this.setData({
            show: true
        })
   },

   //同意申请，将用户信息写入数据库
   yes(){
     db.collection("doctor").add({
      data:{
        name:that.data.applyinfo.userInfo.name,   //单独添加姓名用于模糊查询
        doctorId:that.data.applyinfo._openid,//医生id
        star:0,       //医生关注量
        doctorIntro:that.data.applyinfo.content,   //申请理由
        userInfo:that.data.applyinfo.userInfo,    //用户基本信息
        doctorImages:that.data.applyinfo.images,    //申请资料
        time:new Date(),
      }
    })
    .then(res=>{      //添加成功执行删除申请信息
      console.log('add doctor success:', res)
      that.bedoctor(),
      that.delete(1),
      that.tongzhi(1),
      wx.showToast({
        title: '添加医生成功',
        icon:'success',
        duration:1000,
        mask:false
      })
      setTimeout(function(){
        wx.navigateBack({
          delta:0,
        })
      },1000) 
    })
    .catch(error=>{   //添加失败
      console.log('add doctor error:', error)
      wx.showToast({
        title: '出错了，请重试',
        icon:'none',
        duration:1000,
        mask:false
      })
      setTimeout(function(){
        wx.navigateBack({
          delta:0,
        })
      },1000) 
    })

  },
   //拒绝申请，将用户申请信息删除
   no(){
     that.delete(2);
     that.tongzhi(2);
  },


  //删除用户的申请信息
  delete(e){
    db.collection("bedoctor").where({
      _openid:that.data.applyinfo._openid
  })
  .remove({})
  .then(res=>{    //删除成功
   if(e==2){      //如果是no调用，则提示已拒绝申请
  console.log('delete success:', res)
   wx.showToast({
     title: '已拒绝申请',
     icon:'nono',
     duration:1000,
     mask:false
   })
   setTimeout(function(){
     wx.navigateBack({
       delta:0,
     })
   },1000) 
  }
  else{   //yes调用仅在控制台打印成功信息
    console.log('delete success:', res)
  }
 })
 .catch(error=>{      // 删除失败
   console.log('delete error:', error)
   wx.showToast({
    title: '出错了， 请联系管理员',
    icon:'none',
    duration:1000,
    mask:false
  })
  setTimeout(function(){
    wx.navigateBack({
      delta:0,
    })
  },1000) 
 })
  },

  tongzhi(e){
    if(e==1){
      db.collection("tongzhi").add({
        data:{
          getter:that.data.applyinfo._openid,   //消息发送对象
          message:"恭喜：您的医师申请已通过审核，您现在可以接诊了！",
          time:new Date(),
        }
      }).then(res=>{
        console.log("消息发送成功",res)
      }).catch(error=>{
        console.log("消息发送失败",error)
      })
    }

    else if(e==2){
    db.collection("tongzhi").add({
      data:{
        getter:that.data.applyinfo._openid,   //消息发送对象
        message:"抱歉，您本次提交的医师申请资料审核未能通过，您可完善信息后再次提交!",
        time:new Date(),
      }
    }).then(res=>{
      console.log("消息发送成功",res)
    }).catch(error=>{
      console.log("消息发送失败",error)
    })
  }
  },

  //添加医生成功后改变医生标志
  bedoctor(){
    db.collection('users').where({
      _openid:that.data.applyinfo._openid
    }).update({
      data:{
        isdoctor:true,
      }
    })
  }

})