// pages/ucenter/applyList/applyList.js
const db = wx.cloud.database();
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    applyInfo:[],   //申请信息数组
    index:null,
    noneFlag:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
  },

  onShow:function(){
        //从申请数据库里拿到申请数据
        db.collection("bedoctor")
        .orderBy("time","asc")
        .get({
          success:function(res){
            console.log("申请列表",res)
            if(res.data.length>0)   //有申请信息
            {
              that.setData({
                noneFlag:0,
                applyInfo:res.data,
              })   
            }
            else{
              that.setData({
                noneFlag:1,
                applyInfo:[]
              }) 
            }
          }
        })
  },
  //下拉刷新
  onPullDownRefresh: function() {
    db.collection("bedoctor")
    .orderBy("time","asc")
    .get({
      success:function(res){
        console.log("申请列表",res)
        if(res.data.length>0)
        {
          that.setData({
            noneFlag:0,
            applyInfo:res.data,
          })   
        }
        else{
          that.setData({
            noneFlag:1,
            applyInfo:[]
          }) 
        }
      }
    })
  },

  //传递相应参数
  applyInfo()
  {
    wx.navigateTo({
      url: '../applyInfo/applyInfo',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getCartDatalist',that.data.applyInfo[that.data.index])
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
    that.applyInfo();
  },

})