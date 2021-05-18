// miniprogram/pages/ucenter/bedoctor/bedoctor.js
var that;
const app = getApp();
var db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo:false,
    userInfo:{},
    content:null,       //输入的文字
    textLength: 0,
    images:[],
    images1: [],
    images2: [],
    images3: [],
    maxCount: 3,
    images_upload_success: [], // 图片上传成功后的云端图片地址数组
    images_upload_success_size: 0, // 图片上传成功的数量
    isClickSend: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that =this;
    this.setData({
      userInfo: app.userInfo,
      hasUserInfo:app.globalData.hasUserInfo,
    });
  },

  onShow(){
    that.setData({
      hasUserInfo:app.globalData.hasUserInfo,
     })
         //用户是登录状态
    if(this.data.hasUserInfo){
    }
    //用户非登录状态
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
        return
      }
        //判断该用户是否已经提交过申请资料，还没有审批
        db.collection("bedoctor").where({
          _openid:app.globalData.openid
        })
        .count()
        .then(res=>{
          if(res.total>0){
            //提交过资料还没有审核，禁用提交按钮，并给出提示
            that.setData({
              isClickSend:true,
            })
            wx.showToast({
              title: '您已提交过申请资料，请耐心等待审核！',
              icon:'none',
              duration:1500,
              mask:false
            })
            setTimeout(function(){
              wx.navigateBack({
                delta:0,
              })
            },1500)
          }
        })

        /**
         * author: jmliao
         * date: 2021-4-3
         * 解决问题：判断是否存在已经通过的申请，解决申请通过还有可能在此提交的问题
         */
        db.collection("doctor").where({
          doctorId:app.globalData.openid
        })
        .get()
        .then(res=>{
          if(res.data.length>0){      //已经是医生，防止用户重复提交引发bug

            that.setData({
              isClickSend:true,
            })
            wx.showToast({
              title: '您的申请已通过，请退出重新登录！',
              icon:'none',
              duration:1500,
              mask:false
            })
            setTimeout(function(){
              wx.navigateBack({
                delta:0,
              })
            },1500)
          }
        })
        
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({
      userInfo:{},
    })
  },

  //获取输入内容及长度
  bindInput(e) {
    that.setData({
      content: e.detail.value,
      textLength: e.detail.value.length
    })
  },
  chooseImage1() {
    wx.chooseImage({
      count: that.data.maxCount,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          images1: res.tempFilePaths
        })
      }
    })
  },

  chooseImage2() {
    wx.chooseImage({
      count: that.data.maxCount,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          images2: res.tempFilePaths
        })
      }
    })
  },

  chooseImage3() {
    wx.chooseImage({
      count: that.data.maxCount,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          images3: res.tempFilePaths
        })
      }
    })
  },

  previewImage(e) {
    wx.previewImage({
      current: that.data.images1[e.currentTarget.dataset.index], // 当前显示图片的http链接
      urls: that.data.images1 // 需要预览的图片http链接列表
    })
  },
  previewImage2(e) {
    wx.previewImage({
      current: that.data.images2[e.currentTarget.dataset.index], // 当前显示图片的http链接
      urls: that.data.images2 // 需要预览的图片http链接列表
    })
  },
  previewImage3(e) {
    wx.previewImage({
      current: that.data.images3[e.currentTarget.dataset.index], // 当前显示图片的http链接
      urls: that.data.images3 // 需要预览的图片http链接列表
    })
  },

  uploadImage(index) {
    wx.cloud.uploadFile({
      //将图片上传到云存储bedoctor路径下
      cloudPath: 'bedoctor/' + that.data.userInfo.nickName +new Date().getTime() + "_" + Math.floor(Math.random() * 1000) + ".jpg",
      filePath: that.data.images[index], // 文件路径
      success: res => {
        // get resource ID
        console.log(res.fileID)
        that.data.images_upload_success[index] = res.fileID;
        that.data.images_upload_success_size = that.data.images_upload_success_size + 1;

        
        if (that.data.images_upload_success_size == that.data.images.length) {   //全部上传完毕
          console.log("success:", that.data.images_upload_success)
          that.circleAdd();    //成功上传所有图片后更新数据库
        } else {
          that.uploadImage(index + 1);  //继续上传
        }
      },
      fail: err => {
        that.currentComplete();
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '图片上传失败，请重试',
        })
      }
    })
  },
  clickSend() {
    // 如果文字填写内容为空 或者 没有添加图片 给用户提示
    if(that.data.content==null || that.data.content.replace(/\s*/g,"").length==0 || that.data.images1.length==0 || that.data.images2.length==0 || that.data.images3.length==0 ){
      wx.showToast({
        icon:'none',
        title: '请完整填写资料',
      })
      return ;
    }else{

      //组合图片数组
      that.data.images=that.data.images.concat(that.data.images1);
      that.data.images=that.data.images.concat(that.data.images2);
      that.data.images=that.data.images.concat(that.data.images3);
      console.log("images",that.data.images.length)
    }
    wx.showLoading({
      title: '上传数据中...',
    })
    //上传图片到云存储
    if (that.data.images.length > 0) {
      that.setData({
        images_upload_success: that.data.images
      })
      that.uploadImage(0)
    } 
    else{
      wx.showToast({
        title: '出错了',
        icon:'none',
        duration:800,
        mask:false
      })
    }
  },
  circleAdd(){
    // 将信息添加进云端数据库
    db.collection('bedoctor').add({
      data:{
        content:that.data.content,
        images:that.data.images_upload_success,
        time:new Date(),
        userInfo:that.data.userInfo,
      }
    }).then(res=>{
      console.log('apply success:', res)
      wx.hideLoading()
      wx.showToast({
        title: '提交申请成功',
        icon:'success',
        duration:1000,
        mask:false
      })
      setTimeout(function(){
        wx.navigateBack({
          delta:0,
        })
      },1000)
    }).catch(error=>{
      console.log('add circle error:', error)
      wx.hideLoading()
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


})
