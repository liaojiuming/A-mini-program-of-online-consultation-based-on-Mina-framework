// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
  })
  const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const{
    key
  }= event;
  return db.collection('doctor').where({
    name : db.RegExp({
      regexp: key,
      options: 'i',
    })
  })
  .orderBy("star","desc")
  .get()
  .then(res=>{
    console.log('callfun success',res)
    return{
      code:200,
      data:res.data
    }
  })
  .catch(err=>{
    console.log('fail',err)
    return{
      code:-1,
      errMsg:err.errMsg
    }
  })
}