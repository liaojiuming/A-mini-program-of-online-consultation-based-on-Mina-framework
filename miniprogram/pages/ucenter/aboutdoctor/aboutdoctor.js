// miniprogram/pages/ucenter/aboutdoctor/aboutdoctor.js

const db = wx.cloud.database();
const app = getApp();
var that;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    doctorInfo:{},
    userInfo:{},
    text1Length:0,
    items:[],

    // items: [
    //   {value: '001', name: '内科'},
    //   {value: '002', name: '外科'},
    //   {value: '003', name: '皮肤科'},
    //   {value: '004', name: '儿科'},
    //   {value: '005', name: '妇产科'},
    //   {value: '006', name: '男科'},
    //   {value: '007', name: '五官科'},
    //   {value: '008', name: '精神心理科'},
    //   {value: '009', name: '慢性病科'},
    // ]
  },

  checkboxChange(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    const items = this.data.items
    const values = e.detail.value
    for (let i = 0; i < items.length; ++i) {
      items[i].checked = false

      for (let j = 0; j < values.length; ++j) {
        if (items[i]._id === values[j]) {
          items[i].checked = true
          break
        }
      }
    }
    this.setData({
      items
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that =this;

    //通过数据库获取科室信息
    db.collection("department").get({
      success:function(res){
        console.log("这是数据库里的科室",res)
        that.setData({
          items:res.data,
        })
      }
    })

    //通过openid拿到用户全部信息，解决用户修改信息返回后不立即改变的问题
    db.collection("doctor").where({
      doctorId:app.globalData.openid
    }).get({
      success:function(res){
        console.log("?",res.data[0])
        that.setData({
          doctorInfo:res.data[0],
          userInfo:res.data[0].userInfo,
          text1Length:res.data[0].doctorIntro.length,
        })
        that.depart(res.data[0].department)   //将之前勾选过的科室自动勾选
      }
    })

  },
    //监听输入字数
    bindInputa(e) {
      that.setData({
        text1Length: e.detail.value.length
      })
    },

    onShow(){
      //通过openid拿到用户全部信息，解决用户修改信息返回后不立即改变的问题
      db.collection("doctor").where({
        doctorId:app.globalData.openid
      }).get({
        success:function(res){
          console.log("?",res.data[0])
          that.setData({
            doctorInfo:res.data[0],
            userInfo:res.data[0].userInfo,
            text1Length:res.data[0].doctorIntro.length,
          })
          that.depart(res.data[0].department)   //将之前勾选过的科室自动勾选
        }
      })
    },
  /**
   * 生命周期函数--监听页面显示
   */
  onPullDownRefresh: function () {
        //通过openid拿到用户全部信息，解决用户修改信息返回后不立即改变的问题
        db.collection("doctor").where({
          doctorId:app.globalData.openid
        }).get({
          success:function(res){
            console.log("?",res.data[0])
            that.setData({
              doctorInfo:res.data[0],
              userInfo:res.data[0].userInfo,
              text1Length:res.data[0].doctorIntro.length,
            })
            that.depart(res.data[0].department)   //将之前勾选过的科室自动勾选
          }
        })
  },


  //显示之前勾选过的科室
  depart(e){
    const items = this.data.items
    for (let i = 0; i < items.length; ++i) {
      items[i].checked = false

      for (let j = 0; j <e.length; ++j) {
        if (items[i]._id === e[j]) {
          items[i].checked = true
          break
        }
      }
    }
    this.setData({
      items
    })
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },


  //保存用户输入的信息
  bindFormText:function(e){
    console.log("这是输入的自我介绍",e.detail.value.text1)
    console.log("这是输入任职医院",e.detail.value.text2)
    console.log("这是填写的科室的",e.detail.value.department)

    db.collection('doctor').where({
      doctorId:app.globalData.openid
    }).update({
      data:{
        department:e.detail.value.department,
        doctorIntro:e.detail.value.text1,
        hospital:e.detail.value.text2,
      },
      success:function(){
        wx.showToast({
          title: '保存成功',
          icon:'success',
          duration:1500,
          mask:false
        })
        setTimeout(function(){
          wx.navigateBack({
            delta:0,
          })
        },1500)
      },      
    })
  },


})
