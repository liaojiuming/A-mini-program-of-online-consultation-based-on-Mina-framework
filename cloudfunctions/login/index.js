// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk');
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  console.log(event)
  console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()

  const{
    nickName,
    avatarUrl,
    gender,
  }=event;

  return db.collection('users').where({
    _openid:wxContext.OPENID
  }).count()
  .then(res=>{
    if(res.total>0){
      return{
        code:-1,
        errMsg:'当前用户已存在！'
      }
    }
    else{
      return db.collection('users').add({
        data:{
          _openid:wxContext.OPENID,
          nickName:nickName,
          avatarUrl:avatarUrl,
          gender:gender,
          name:null,
          age:0,
          intro:'',
          history:'',
          phone:'',
          isdoctor:false,
          isadmin:false,
          time:new Date()
        }
      })
    }
  })

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  //   env: wxContext.ENV,
  // }
}

