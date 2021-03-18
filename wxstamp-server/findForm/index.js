// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userOpenid = wxContext.OPENID;
  const db = cloud.database();
  const selectedRequestID = event.selectedRequestID * 1;
  const surfSubmittedAllowed = db.collection('sealUseRequestFormSubmittedAllowed');
  const surfSubmittedNotAllowed = db.collection('sealUseRequestFormSubmittedNotAllowed');
  const surfSubmittedToBeVerified = db.collection('sealUseRequestFormSubmittedToBeVerified');
  const surfComplete = db.collection('sealUseRequestFormComplete');
  var surf = await surfSubmittedToBeVerified.where({requestID:selectedRequestID}).get();
  //console.log(surf.data)
  var isEmpty = await surf.data.length == 0
  //var cryptedData = '';
  if (isEmpty){
    surf = await surfSubmittedAllowed.where({requestID:selectedRequestID}).get();
    isEmpty = await surf.data.length == 0
    if (isEmpty){
      surf = await surfSubmittedNotAllowed.where({requestID:selectedRequestID}).get();
      isEmpty = await surf.data.length == 0
      if (isEmpty){
        surf = await surfComplete.where({requestID:selectedRequestID}).get();
        isEmpty = await surf.data.length == 0
      //  if (surf.data[0].hasOwnProperty("cryptedDataPath")){
       //   console.log('是加密的');
        //  cryptedData = await downloadCryptedData(surf.data[0].cryptedDataPath)
        //  surf.data[0].cryptedData = cryptedData;
        //  console.log('cryptedData',surf.data[0].cryptedData)
       // }
      }
    }
  }

  console.log(surf.data)
  //console.log(isEmpty)
  return {
    event,
    data: surf.data,
    isEmpty: isEmpty
  }
}

downloadCryptedData = async (path)=>{
  console.log('开始下载',path)
  const cryptedData = await cloud.downloadFile({
    fileID: path, // 文件 ID
  })
  //console.log(cryptedData.fileContent.toString('utf8'),'cryptedData');
  return cryptedData.fileContent.toString('utf8')
}