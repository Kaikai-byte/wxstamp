var app = getApp();

const sm = require('../../miniprogram_npm/miniprogram-sm-crypto/index');
const db = wx.cloud.database();
const sealUseRequestFormSubmittedToBeVerifiedDB = db.collection('sealUseRequestFormSubmittedToBeVerified');
const sealUseRequestFormSubmittedAllowedDB = db.collection('sealUseRequestFormSubmittedAllowed');
const sealUseRequestFormSubmittedNotAllowedDB = db.collection('sealUseRequestFormSubmittedNotAllowed');


Component({
  data: {
    form:{},
    sealArray:null,
    buttonDisable:true
  },
  methods: {
    onPullDownRefresh: function(){
      this.downloadCryptedData(this.data.form.cryptedDataPath);
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
    },

    onShow: function () {
      this.setData({sealArray: app.globalData.sealArray});
      let that = this;
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on("getForm",data=>{
        that.setData({
          form: data
        });
        if (that.data.form.hasOwnProperty('cryptedDataPath')){
          that.downloadCryptedData(that.data.form.cryptedDataPath)
          wx.showLoading({
            title:"下载加密数据中..."
          })
        }

   //     console.log(that.data.form,"我被传过来了")
  //      console.log(JSON.stringify(that.data.form))
      })
      //   that.setData({crypted:true})


    },

    bindPasswdInput: function(e){
      console.log(e.detail.value);
      this.setData({passwd:e.detail.value})
    },

    decrypt: function(){
      wx.showLoading({
        title:"正在解密",
      })
      console.log('开始解密')
      this.setData({buttonDisable:true})
      let sm3 = sm.sm3
      let sm4 = sm.sm4
      console.log('对密码SM3哈希')
      var passwdSM3 = this.stringToHex(sm3(this.data.passwd).slice(0,16));
      var that = this;
      try{
        console.log('SM4解密开始')
        var decryptedForm = sm4.decrypt(this.data.cryptedData,passwdSM3)
        console.log('decryptedForm:',decryptedForm)
        var decryptedFormHash = sm3(decryptedForm)
        console.log('SM4解密完成，开始校验')
        wx.hideLoading({
          success: (res) => {},
        })
        //console.log(decryptedForm,'解密数据');
        //console.log(this.data.form.hash,'原哈希');
        if (decryptedFormHash != this.data.form.hash){
          that.setData({buttonDisable:false})
          wx.showToast({
            title:"密码错误",
            icon:"error",
            duration:600
          })
          throw new Error ('密码错误')
        }
        console.log('校验正确')
        wx.showToast({
          title:"解密成功",
          icon:"success",
          duration:600
        })
        wx.navigateTo({
          url: '/pages/displayform/displayform',
        success: function(res){
          res.eventChannel.emit('getForm',JSON.parse(decryptedForm))
        }})
      }
      catch{
        wx.showToast({
          title:"密码错误",
          icon:"error",
          duration:600
        })
        that.setData({buttonDisable:false})
      }
    },

    downloadCryptedData: function(path){
      var that = this;
      console.log('下载加密数据中...',path)
      wx.cloud.downloadFile({
        fileID: path, // 文件 ID
        success: res => {
          // 返回临时文件路径
          console.log('下载完成',res)
          that.setData({tempCryptedDataPath: res.tempFilePath});
          setTimeout(function(data){
            that.readCryptedData(data)
          },1,that.data)
        },
        fail: console.error
      })
      console.log('tempCryptedDataPath',that.data.tempCryptedDataPath)
    },

    readCryptedData:function(data){
      var that = this;
      console.log('读取加密数据')
      wx.getFileSystemManager().readFile({
        filePath: data.tempCryptedDataPath,
        encoding :'utf8',
        success(res){
          //console.log(res);
          if (res.data != ''){
            that.setData({cryptedData: res.data})
            console.log('读取完成')
            wx.hideLoading({
              success: (res) => {},
            });
            wx.showToast({
              title:"下载完成",
              icon:"success",
              duration:600
            })
            that.setData({buttonDisable:false})
          }
          else{
            wx.hideLoading({
              success: (res) => {},
            });
            wx.showToast({
              title:"下载到空文件",
              icon:"error",
              duration:600
            })
          }   
        },
        fail(res){
          wx.hideLoading({
            success: (res) => {},
          });
          wx.showToast({
            title:"出错啦",
            icon:"error",
            duration:600
          })
          console.log(res)
        }
      })
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
    },

  }
});
