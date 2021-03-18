// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event) => {
  const db = cloud.database();
  const selectedRequestID = event.selectedRequestID * 1;
  const verifyTime = event.verifyTime;
  const surfSubmittedNotAllowed = db.collection('sealUseRequestFormSubmittedNotAllowed');
  const surfSubmittedToBeVerified = db.collection('sealUseRequestFormSubmittedToBeVerified');
  var surftbv = await surfSubmittedToBeVerified.where({requestID:selectedRequestID}).get();
  console.log(event.selectedRequestID )
  console.log(surftbv.data)
  var isEmpty = await surftbv.data.length == 0;
  if (!isEmpty){
    surftbv.data[0].status = "不通过";
    surftbv.data[0].verifyTime = verifyTime;
    surftbv.data[0].verifyOpenID = event.userInfo.openId;
    await surfSubmittedNotAllowed.add({data:surftbv.data[0]});
    await surfSubmittedToBeVerified.where({requestID:selectedRequestID}).remove();
  }
  console.log(surftbv.data)
  console.log(isEmpty)
  return {
    event,
    data: surftbv.data,
    isEmpty: isEmpty  
  }
}