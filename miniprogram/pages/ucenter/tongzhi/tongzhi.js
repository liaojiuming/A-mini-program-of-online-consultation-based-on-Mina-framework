// miniprogram/pages/ucenter/tongzhi/tongzhi.js
const db = wx.cloud.database();
const app = getApp();
var that;
Page({

  data: {
    hasUserInfo:false,
    messInfo:[],   //消息数组
    someMess:[],    //显示前几个字符
    index:null,
    noneFlag:1,
  },


  onLoad: function (options) {
        that = this;
        this.setData({
          slideButtons: [{
            type: 'warn',
            text: '删除',
            extClass: 'test',
          }],

          hasUserInfo:app.globalData.hasUserInfo,
      });

        if(that.data.hasUserInfo){
          //从通知集合里拿出属于当前用户的通知
          getList();    
        }
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

  onShow(){
    that.setData({
      hasUserInfo:app.globalData.hasUserInfo,
     })
    if(that.data.hasUserInfo){
    }
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
  
  //传递相应参数
  messInfo()
  {
    wx.navigateTo({
      url: '../tongzhi/messInfo',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getCartDatalist',that.data.messInfo[that.data.index])
      }
     })

  },

  //先获取到选择项
  onChoose(e){
    console.log("onchoose",e)
    that.setData({
      index:e.currentTarget.id,
    })
    console.log("onchoose",e.currentTarget.id)
    that.messInfo();
  },

//左滑删除通知
  slideButtonTap(e){
    db.collection("tongzhi").where({
      _id:that.data.messInfo[e.currentTarget.id]._id,
    })
    .remove({
      success: function(res) {
        console.log("删除通知成功",res)
        wx.showToast({
          title: '删除成功',
          icon:'success',
          duration:1500,
          mask:false
        })
        that.setData({    //删除成功先清空列表
          someMess:[]
        })
        getList();        //在重新获取，达到即时显示的效果
      }
    })
  }

})

//提取通知消息列表
function getList() {
  db.collection("tongzhi")
    .orderBy("time", "desc")
    .where({
      getter: app.globalData.openid,
    })
    .get({
      success: function (res) {
        console.log("消息", res);
        if (res.data.length > 0) //有消息
        {
          for (var i = 0; i < res.data.length; i++) //取消息前几个字符作为提示性文字
          {
            that.data.someMess.push(res.data[i].message.substring(0, 6));
          }
          that.setData({
            noneFlag: 0,
            messInfo: res.data,
            someMess: that.data.someMess,
          });
        }
        else {
          that.setData({
            noneFlag: 1,
            messInfo: []
          });
        }
      }
    });
}
