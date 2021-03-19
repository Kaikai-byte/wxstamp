var app = getApp();

const db = wx.cloud.database();
const sealUseRequestFormSubmittedToBeVerifiedDB = db.collection('sealUseRequestFormSubmittedToBeVerified');
const sealUseRequestFormSubmittedAllowedDB = db.collection('sealUseRequestFormSubmittedAllowed');
const sealUseRequestFormSubmittedNotAllowedDB = db.collection('sealUseRequestFormSubmittedNotAllowed');


Component({
  data: {
    form:{},
    sealArray:null
  },
  methods: {
      onLoad: function () {
        this.setData({sealArray: app.globalData.sealArray});
        let that = this;
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.on("getForm",data=>{
          that.setData({
            form: data
          });
        })
      },

      onUnload: function(){
        wx.navigateTo({
          url: '/pages/index/index',
        })
      },

      imagetap: function(e){
        var that = this;
        console.log(e.currentTarget.id)
        var idx = e.currentTarget.id;        
        var aa = wx.getFileSystemManager();
        aa.writeFile({
          filePath:wx.env.USER_DATA_PATH+'/test.png',
          data: that.data.form.imgData[idx],
          encoding:'base64',
          success: res => {
            wx.saveImageToPhotosAlbum({
              filePath: wx.env.USER_DATA_PATH + '/test.png',
              success: function (res) {
                wx.showToast({
                  title: '保存成功',
                })
              },
              fail: function (err) {
                console.log(err)
              }
            })
            console.log(res)
          }, fail: err => {
            console.log(err)
          }
        })
      }
  }
});
