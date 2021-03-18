const cloud = require('wx-server-sdk')
const sm2 = require('miniprogram-sm-crypto').sm2;

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  let keypair = sm2.generateKeyPairHex();

  publicKey = keypair.publicKey; // 公钥
  privateKey = keypair.privateKey; // 私钥

  return {
    event,
    publicKeySM2: keypair.publicKey,
  }
}

