// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userOpenid = wxContext.OPENID;
  const db = cloud.database();
  const adminOpenid = db.collection('adminOpenid');
  const userList = db.collection('userList');
  console.log('event:',event)
  var hist = await adminOpenid.where({adminid:userOpenid}).get();
  var isAdmin = await hist.data.length != 0
  await userList.where({'_id':userOpenid}).remove();
  await userList.add({data:{'_id':userOpenid,'isAdmin':isAdmin, 'publicKey':event.publicKey}});
  console.log(hist.data)
  console.log(isAdmin)
  return {
    event,
    openid:event.userInfo.openId,
    isAdmin: isAdmin
  }
}