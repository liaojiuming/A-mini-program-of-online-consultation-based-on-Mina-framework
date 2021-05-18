const db = wx.cloud.database();
const app = getApp();
var that;
Page({
  data: {
      hasUserInfo:false,
      doctor:[],        //接收直接查询的所有用户
      doctorInfo:{},        //接收模糊查询点击用户信息
      index:null,
  },
  onLoad() {
      that=this,
      this.setData({
          hasUserInfo:app.globalData.hasUserInfo,
          search: this.search.bind(this)
      })
if(that.data.hasUserInfo)
{      //按关注数量排名推荐医生
      db.collection("doctor")
      .orderBy("star","desc")
      .get()
      .then(res=>{
        console.log('find doctor success',res)
        that.setData({
            doctor:res.data
        })
      })}
  },
  
  search: function (value) {
    return wx.cloud.callFunction({
        name:'searchDoctor',            //调用云函数模糊查询
        data:{
            key:value
        },
      }).then(res=>{
          console.log("search success",res)
          var result = [];
          if(res.result.data.length>0){
              for(var i=0; i<res.result.data.length;i++){
                  var item = {};
                  item.text = res.result.data[i].name;
                  item.value=i+1;
                  item.doctor = res.result.data[i];
                  result.push(item)
              }
          }
          return result;
      }).catch(err=>{
        console.log("search fail",err)
      })
  },


  //点击搜索结果触发的事件
  selectResult: function (e) {
      console.log('select result', e.detail)
      that.setData({
          doctorInfo:e.detail.item.doctor,      //获取点击的医生数据
      })
      wx.navigateTo({
        url: '../doctorInfo/doctorInfo',
        success: function(res) {            //将所点击的医生信息传递到医生详情页面
          res.eventChannel.emit('getCartDatalist',that.data.doctorInfo)     
        }
       })  
  },

    //传递相应参数
    doctorInfo()
    {
      console.log("你选的",that.data.doctor[that.data.index])
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

    login(){
        wx.switchTab({
          url: '../ucenter/index/index'
        })
      }
    

});