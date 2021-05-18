const db = wx.cloud.database();
const _=db.command;
var that;
Page({
  onShareAppMessage() {
    return {
      title: '线上问诊小程序',
      path: 'pages/main/main'
    }
  },

  data: {
    indicatordots:true,
    autoplay:true,
    interval:3000,
    duration:1000,
    bannerUrl:[],       //问诊图片
    title:[],           //问诊标题
    id:[],              //问诊的id
    currentBanner:0,    //获取当前位置
    goodDoctor:[],    //推荐医生
    index:'',         //记录点击的医生
  },

  onLoad:function(options){
    that=this;
    that.addBannerUrl();
    that.addDoctor();
  },

  //查找最近三篇新闻
  addBannerUrl(){
    db.collection("news")
    .orderBy("time","desc")
    .get({
      success:function(res){
        console.log("这是获取的新闻信息",res)
        that.setData({
          bannerUrl:[res.data[0].image,res.data[1].image,res.data[2].image],
          title:[res.data[0].title,res.data[1].title,res.data[2].title],
          id:[res.data[0]._id,res.data[1]._id,res.data[2]._id]
        })

        console.log("id",that.data.id)
      }
    })
  },

  bindChange(e){    //点击新闻轮播图触发的事件
    that.setData({
      currentBanner:e.detail.current,
    })
  },

    //向打开的新闻页面传入文章id
    toNews(){
      wx.navigateTo({
        url: '../news/news',
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('getCartDatalist',that.data.id[that.data.currentBanner])  //触发事件
        }
       })
    },


  addDoctor(){
    db.collection("doctor")
    .orderBy("star","desc")
    .get()
    .then(res=>{
      if(res.data.length>0){
        that.setData({
          goodDoctor:[res.data[0],res.data[1],res.data[2],res.data[3]]
        })
      }
    })
  },

    //传递相应参数到医生详情页面
    doctorInfo()
    {
      console.log("从医生推荐里选的",that.data.goodDoctor[that.data.index])
      wx.navigateTo({
        url: '../doctorInfo/doctorInfo',
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('getCartDatalist',that.data.goodDoctor[that.data.index])
        }
       })
  
    },
    //先获取到选择项
    onChooseDoctor(e){
      if(getApp().globalData.hasUserInfo){      
        console.log("onchoose",e)
      that.setData({
        index:e.currentTarget.id,
      })
      console.log("onchoose",e.currentTarget.id)
      that.doctorInfo();
    }
    else{
      wx.showToast({
        title: '请先登录',
        icon:'none',
        duration:800,
        mask:false
      })
    }
    },

    onChooseDepart(e){
      if(getApp().globalData.hasUserInfo){      
        console.log("onchoose",e)
        wx.navigateTo({
          url: '../searchDepart/searchDepart?departId='+e.currentTarget.id,
        })
        }
        else{
            wx.showToast({
              title: '请先登录',
              icon:'none',
              duration:800,
              mask:false
            })
          }
    },

})