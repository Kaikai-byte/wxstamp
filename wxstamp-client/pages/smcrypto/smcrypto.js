const sm = require('../../miniprogram_npm/miniprogram-sm-crypto/index');

function compareArray(a, b) {
  if (a.length !== b.length) return false

  for (let i = 0, len = a.length; i < a; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

Page({
  onLoad() {
    //this.sm2()
   // this.sm3('Sh470310sh')
    this.sm4()
  },

  sm2() {
    let sm2 = sm.sm2
    let msgString = 'absasdagfadgadsfdfdsf'
    let cipherMode = 1

    let keypair = sm2.generateKeyPairHex()
    let publicKey = keypair.publicKey
    let privateKey = keypair.privateKey
    console.log('sm2 --> generate keypair', publicKey.length === 130 && privateKey.length === 64)

    let encryptData = sm2.doEncrypt(msgString, publicKey, cipherMode)
    let decryptData = sm2.doDecrypt(encryptData, privateKey, cipherMode)
    console.log('sm2 --> encrypt and decrypt data', decryptData === msgString)
  },

  sm3(passwd) {
    let sm3 = sm.sm3
    var hash = sm3(passwd).slice(0,16)
    return hash;
  },

  sm4() {
     let sm4 = sm.sm4

    const msg = '{"_id":"b00064a7603f784008274c9a0a14868a","submitTime":"2021/3/3 下午7:51:30","_openid":"ojQSE4l9BOp5vszrATEQIG7A5Sfk","isVerified":false,"reasonOfRequest":"","requestDate":"2021-02-18","requestID":1614772284757,"sealIndex":0,"status":"通过","verifyTime":"2021/3/3 下午7:51:33","verifyOpenID":"ojQSE4l9BOp5vszrATEQIG7A5Sfk"}' // 可以为 utf8 串或字节数组
    const key = this.stringToHex(this.sm3('9'))// 可以为 16 进制串或字节数组，要求为 128 比特
   // console.log(this.stringToHex(this.sm3('990819')))
    //const key = this.stringToHex(this.sm3('990819'));
   // const encryptData = '0e395deb10f6e8a17e17823e1fd9bd98a1bff1df508b5b8a1efb79ec633d1bb129432ac1b74972dbe97bab04f024e89c' // 可以为 16 进制串或字节数组
console.log(key)
    let encryptData = sm4.encrypt(msg, key) // 加密，默认输出 16 进制字符串，默认使用 pkcs#5 填充
console.log(encryptData);
   let decryptData = sm4.decrypt('f681be16fbdafcfbbb3e41d84734f1cfc441a8d13219445bd48024d0f5c9a011a2da84635c55b2be1395fa300699a14c54e34a3835111be22f402d7e4c1c9f6e7788982fad89f293d1c403cc44ab20be6937586ecab09d9a5a4dae26d7c8c647e01b5df7d0bb18367e2770b8f3f76eefd39ae279d',key)
    console.log(decryptData)
    console.log(JSON.parse(decryptData))
  },

  stringToHex: function(str){
    var val = "";
    for (var i = 0; i < str.length; i++) {
        if (val == "") {
            val = str.charCodeAt(i).toString(16);        //获取字符的Unicode码然后转16进制
        } else {
            val += str.charCodeAt(i).toString(16);//获取字符的Unicode码然后转16进制再拼接,中间用逗号隔开
        }
    }
  //  console.log(val)
    return val.toString();

}

})
