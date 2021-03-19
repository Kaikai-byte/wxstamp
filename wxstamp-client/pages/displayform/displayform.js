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
      }
  }
});
