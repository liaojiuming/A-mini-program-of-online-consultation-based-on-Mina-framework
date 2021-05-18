// miniprogram/pages/searchDepart/searchDepart.js
const db = wx.cloud.database()
const _ = db.command
var that
Page({

  /**
   * 页面的初始数据
   */
  data: {
    departId:'',
    doctor:[],
    index:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that=this
    that.setData({
      departId:options.departId
    })
    db.collection("doctor")
    .orderBy("star","desc")
    .where({
      department:_.all([that.data.departId])
    })
    .get()
    .then(res=>{
      if(res.data.length>0)
      that.setData({
        doctor:res.data
      })
    })

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //传递相应参数
  doctorInfo()
  {
    wx.navigateTo({
      url: '../doctorInfo/doctorInfo',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('getCartDatalist',that.data.doctor[that.data.index])
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
    that.doctorInfo();
  },
})