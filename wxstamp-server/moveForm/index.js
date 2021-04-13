// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const sm2 = require('miniprogram-sm-crypto').sm2;

// 云函数入口函数
exports.main = async (event) => {
  const db = cloud.database();
  const selectedRequestID = JSON.parse(event.parameterStringfy).selectedRequestID * 1;
  const verifyTime = JSON.parse(event.parameterStringfy).verifyTime;
  const surfSubmittedAllowed = db.collection('sealUseRequestFormSubmittedAllowed');
  const surfSubmittedNotAllowed = db.collection('sealUseRequestFormSubmittedNotAllowed');
  const surfSubmittedToBeVerified = db.collection('sealUseRequestFormSubmittedToBeVerified');
  const userList = db.collection('userList');


  var surftbv = await surfSubmittedToBeVerified.where({requestID:selectedRequestID}).get();
  var currentUser = await userList.where({_id:event.userInfo.openId}).get();
  console.log(currentUser.data[0].publicKey)

  var publicKey = currentUser.data[0].publicKey;
  var permit = event.permit;
  var verifyResult = sm2.doVerifySignature(event.parameterStringfy, event.signature, publicKey, {
    hash: true,
  });

  console.log('verifyResult:',verifyResult)

  console.log(surftbv.data)

  var isEmpty = await surftbv.data.length == 0;
  if(verifyResult){
    if (permit){
      if (!isEmpty){
        surftbv.data[0].status = "通过";
        surftbv.data[0].verifyTime = verifyTime;
        surftbv.data[0].verifyOpenID = event.userInfo.openId;
        await surfSubmittedAllowed.add({data:surftbv.data[0]});
        await surfSubmittedToBeVerified.where({requestID:selectedRequestID}).remove();
      }
      console.log(surftbv.data)
      console.log(isEmpty)
    }
    else{
      if (!isEmpty){
        surftbv.data[0].status = "不通过";
        surftbv.data[0].verifyTime = verifyTime;
        surftbv.data[0].verifyOpenID = event.userInfo.openId;
        await surfSubmittedNotAllowed.add({data:surftbv.data[0]});
        await surfSubmittedToBeVerified.where({requestID:selectedRequestID}).remove();
      }
      console.log(surftbv.data)
      console.log(isEmpty)
    }
  }
  return {
    event,
    data: surftbv.data,
    isEmpty: isEmpty,  
    isVerified: verifyResult
  }
}