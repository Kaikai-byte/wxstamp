var app = getApp();

const db = wx.cloud.database();
const sealUseRequestFormSubmittedToBeVerifiedDB = db.collection('sealUseRequestFormSubmittedToBeVerified');
const sealUseRequestFormSubmittedAllowedDB = db.collection('sealUseRequestFormSubmittedAllowed');
const sealUseRequestFormSubmittedNotAllowedDB = db.collection('sealUseRequestFormSubmittedNotAllowed');

const sm = require('../../miniprogram_npm/miniprogram-sm-crypto/index');
const sm2 = sm.sm2

Page({
  data: {
    canIUse: false,
    sealUseRequestFormSubmittedToBeVerified:[],
    sealUseRequestFormSubmittedAllowed:[],
    sealUseRequestFormSubmittedNotAllowed:[],
    sealArray:[],
    showToBeVerifiedActionsheet: false,
    toBeVerifiedGroups: [
        { text: '查看', value: 1 },
        { text: '审核通过', value: 2},
        { text: '审核不通过', value: 0 }
    ],
    showVerifiedActionsheet: false,
    verifiedGroups: [
        { text: '查看', value: 1 },
    ]
  },


  toBeVerifiedChangeOPClose(e){
    this.setData({
      showToBeVerifiedActionsheet: false
  });
  },
  
  toBeVerifiedFormClick(e) {
    this.setData({
      showToBeVerifiedActionsheet: true
  });
  app.globalData.selectedRequestID = e.currentTarget.id;
  console.log('app.globalData.selectedRequestID:'+app.globalData.selectedRequestID);
  },

  verifiedChangeOPClose(e){
    this.setData({
      showVerifiedActionsheet: false
  });
  },

  verifiedFormClick(e) {
    this.setData({
      showVerifiedActionsheet: true
  });
  app.globalData.selectedRequestID = e.currentTarget.id;
  console.log('app.globalData.selectedRequestID:'+app.globalData.selectedRequestID);
  },  


  viewForm: function(e) {
    var RequestID = app.globalData.selectedRequestID;
    wx.showLoading({
      title: '下载中...',
    })
    wx.cloud.callFunction({
      name: 'findForm',
      data: {selectedRequestID:RequestID},
      success: res => {
        if (!res.result.isEmpty)
        {
          var formData = res.result.data[0];
        console.log(formData)
        wx.hideLoading({
          success: (res) => {},
        })
        wx.navigateTo({
          url: '/pages/displayform/displayform',
        success: function(res){
          res.eventChannel.emit('getForm',formData)
        }})
      }
      },
      fail: err => {
        wx.hideLoading({
          success: (res) => {},
        })
        console.error('[云函数] [findForm] 调用失败', err)
        wx.showToast({
          title:"获取表单失败",
          icon:'error',
          duration: 600
        })
      }
    })
  },


  allowForm:function(e){
    var myDate = new Date();
    var verifyTime = myDate.toLocaleString();
    var RequestID = app.globalData.selectedRequestID;
    var parameterStringfy = JSON.stringify({selectedRequestID:RequestID, verifyTime:verifyTime})
    var sigValueHex = sm2.doSignature(parameterStringfy, app.globalData.privKey, {
      hash: true,
    });
    console.log(sigValueHex)

    wx.showLoading({
      title: '云端同步中...',
    })
    wx.cloud.callFunction({
      name: 'moveForm',
      data: {      
        parameterStringfy: parameterStringfy,
        signature: sigValueHex,
        permit: true
      },
      success: res => {
        if (!res.result.isEmpty)
        {
          var formData = res.result.data[0];
        console.log(formData)      
        }
        console.log('[云函数] [moveForm] 调用成功', res)
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
          title:"数据库操作成功",
          icon:'success',
          duration: 600
        })
      },
      fail: err => {
        console.error('[云函数] [moveForm] 调用失败', err)
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
          title:"调用失败",
          icon:'error',
          duration: 600
        })
      }
    })
  },

  notAllowForm:function(e){
    var myDate = new Date();
    var verifyTime = myDate.toLocaleString();
    var RequestID = app.globalData.selectedRequestID;
    var parameterStringfy = JSON.stringify({selectedRequestID:RequestID, verifyTime:verifyTime})
    var sigValueHex = sm2.doSignature(parameterStringfy, app.globalData.privKey, {
      hash: true,
    });
    let that = this;
    console.log(sigValueHex)

    wx.showLoading({
      title: '云端同步中...',
    })
    wx.cloud.callFunction({
      name: 'moveForm',
      data: {      
        parameterStringfy: parameterStringfy,
        signature: sigValueHex,
        permit: false
      },
      success: res => {
        if (!res.result.isEmpty)
        {
          var formData = res.result.data[0];
        console.log(formData)      
        }
        console.log('[云函数] [moveForm] 调用成功', res)
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
          title:"数据库操作成功",
          icon:'success',
          duration: 600
        })
        that.updateForm();
      },
      fail: err => {
        console.error('[云函数] [moveForm] 调用失败', err)
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
          title:"调用失败",
          icon:'error',
          duration: 600
        })
      }
    })
  },

  toBeVerifiedChangeOPMenu:function(e){
    switch(e.detail.value){
      case 1:this.viewForm();
        break;
      case 2:this.allowForm(app.globalData.selectedRequestID);
        break;
      case 0:this.notAllowForm(app.globalData.selectedRequestID);
        break;
    }
    this.setData({
      showToBeVerifiedActionsheet: false
  });
  },

  verifiedChangeOPMenu:function(e){
    switch(e.detail.value){
      case 1:this.viewForm();
        break;
      case 2:this.submitForm(app.globalData.selectedRequestID);
        break;
      case 0:this.deleteForm(app.globalData.selectedRequestID);
        break;
    }
    this.setData({
      showVerifiedActionsheet: false
  });
  },
  
  updateForm: function(){
    sealUseRequestFormSubmittedToBeVerifiedDB.get().then(res=>{
      this.setData({sealUseRequestFormSubmittedToBeVerified: res.data})
    })
    sealUseRequestFormSubmittedAllowedDB.get().then(res=>{
      this.setData({sealUseRequestFormSubmittedAllowed: res.data})
    })    
    sealUseRequestFormSubmittedNotAllowedDB.get().then(res=>{
      this.setData({sealUseRequestFormSubmittedNotAllowed: res.data})
    })
  },

  onLoad: function(){
    this.setData({sealArray:app.globalData.sealArray});
    this.updateForm();
  },
  
  onPullDownRefresh: function(){
    this.updateForm();
    wx.stopPullDownRefresh({
      success: (res) => {},
    })
  },

  
  onShow: function(){
    this.setData({canIUse:app.globalData.isAdmin});
    if (app.globalData.logged)
    {
      if (this.data.canIUse)
      {
        this.updateForm();
      }
      else
      {
        wx.showToast({
          title: '您不是管理员',
          icon:"error",
          duration:600
        })
      }
    }
    else
    {
      wx.showToast({
        title: '请先登录',
        icon:"none",
        duration:600
      })
    }
  }

})
