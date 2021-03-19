var app = getApp();
const sm = require('../../miniprogram_npm/miniprogram-sm-crypto/index');
const db = wx.cloud.database();
const sealUseRequestFormCompleteDB = db.collection('sealUseRequestFormComplete');
const sealUseRequestFormSubmittedAllowedDB = db.collection('sealUseRequestFormSubmittedAllowed')

Component({
  data: {
    form:{},
    images: [],
    passwd:'',
    passwdSM3:'',
    sealArray:null,
    showPasswdEmptyError:false,
    showProcessing:false,
    imgData:[],
    dataCloudPath:'',
    buttonDisabled: false,
    useStampNumber: null
  },
  methods: {
    onLoad: function () {
      this.setData({
        sealArray: app.globalData.sealArray,
        selectFile: this.selectFile.bind(this),
        uploadFile: this.uploadFile.bind(this)
      });
      let that = this;
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on("getForm",data=>{
        that.setData({
          form: data
        });
        console.log(that.data.form,"我被传过来了")
        console.log(JSON.stringify(that.data.form),'字符串')
      })
    },
    completeForm: function(){
      console.log('[completeForm]:按下按钮');
      this.setData({buttonDisabled:true})
      if (this.data.passwd.length != 0){
        this.setData({showProcessing:true});
        var myDate = new Date();
        var completeTime = myDate.toLocaleString();
        let sm3 = sm.sm3
        let sm4 = sm.sm4
        var encryptForm = JSON.parse(JSON.stringify(this.data.form));
        encryptForm.useStampNumber = this.data.useStampNumber;
        encryptForm.imgData = this.data.imgData;
        encryptForm.completeDate = completeTime;          
        
        var passwdSM3 = this.stringToHex(sm3(this.data.passwd).slice(0,16));
        console.log('[completeForm]:完成stringToHex')

        
        var hash = sm3(JSON.stringify(encryptForm));
        console.log('[completeForm]:完成hash')
       
        var encryptedForm = sm4.encrypt(JSON.stringify(encryptForm),passwdSM3)

        console.log("[completeForm]:全文加密完成")

        //console.log(encryptedForm);


        this.uploadForm(encryptedForm,
          {
            sealindex:this.data.form.sealIndex,
            requestid:this.data.form.requestID,
            date:this.data.form.requestDate,
            hash:hash
          }
        );
        this.setData({showProcessing:false})
      }
      else{
        this.setData({showPasswdEmptyError:true})
      }
    },

    uploadForm:function(crypteddata,info){
      var that = this;
      wx.getFileSystemManager().writeFile({
        filePath:`${wx.env.USER_DATA_PATH}/`+info.requestid+'.txt',
        data: crypteddata,
        encoding: 'utf8'
      });
      wx.cloud.uploadFile({
        // 指定上传到的云路径
        cloudPath: info.requestid+'.txt',
        // 指定要上传的文件的小程序临时文件路径
        filePath: `${wx.env.USER_DATA_PATH}/`+info.requestid+'.txt',
        // 成功回调
        success: res => {
          that.setData({dataCloudPath: res.fileID});
          console.log('上传数据成功', res)
          setTimeout(function(info,data){
            if (data.dataCloudPath != ''){
              sealUseRequestFormCompleteDB.add({
                data:{
                  sealIndex: info.sealindex,
                  requestDate: info.date,
                  requestID: info.requestid,
                  hash:info.hash,
                  cryptedDataPath: data.dataCloudPath,
                  status: "完成"
                }
              }).then(res=>{
                wx.showToast({
                  title:"提交成功",
                  icon:"success",
                  duration:600
                })
                console.log(info);
                sealUseRequestFormSubmittedAllowedDB.where({requestID:info.requestid}).remove().then(res=>{
                  console.log('[completeForm]:从allowedDB删除成功')
                });
              })
            }
            else{
              wx.showToast({
                title:"请再试一次",
                icon:"error",
                duration:600
              })
            }
          },1,info,that.data)
        }
      })

    },

    bindPasswdInput:function(e){
      this.setData({
        passwd:e.detail.value
      })
    },

    bindUseStampNumberInput:function(e){
      this.setData({
        useStampNumber:e.detail.value
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

    urlTobase64(imgPath) {
      //读取图片的base64文件内容
      var that = this;
      wx.getFileSystemManager().readFile({
        filePath: imgPath, //选择图片返回的相对路径
        encoding: 'base64', //编码格式
        success: function(res){
          that.data.imgData.push(res.data)
          wx.showToast({
            title:"转换Base64成功",
            icon:"success",
            duration:600
          })
        }//成功的回调
      })
      console.log('[completeForm]:完成encode')
    },
    previewImage: function(e){
      wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: this.data.images, // 需要预览的图片http链接列表
      })
    },
    selectFile(images) {
      console.log('images', images)
      // 返回false可以阻止某次文件上传
    },
    uploadFile(images) {
      var that = this;
      console.log('upload images', images)
      for (var i = 0; i < images.tempFilePaths.length; i++) {
        var image = {};
        image.url = images.tempFilePaths[i];
        image.loading = false;
        image.error = false;
        that.data.images.push(image);
        that.urlTobase64(images.tempFilePaths[i])
        console.log('[completeForm]:完成urlTobase64,第',i+1,'张，共',images.tempFilePaths.length,'张')
      };
      console.log('that.data.images:',that.data.images)
      // 文件上传的函数，返回一个promise
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({urls:[that.data.images[that.data.images.length - 1].url]})
        }, 1)
      })
    },
    uploadError(e) {
      console.log('upload error', e.detail)
    },
    uploadSuccess(e) {
      console.log('upload success', e.detail)
    }
  },
});
