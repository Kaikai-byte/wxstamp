var app = getApp();

const db = wx.cloud.database();
const sealUseRequestFormSubmittedToBeVerifiedDB = db.collection('sealUseRequestFormSubmittedToBeVerified');
const sealUseRequestFormSubmittedAllowedDB = db.collection('sealUseRequestFormSubmittedAllowed');
const sealUseRequestFormSubmittedNotAllowedDB = db.collection('sealUseRequestFormSubmittedNotAllowed');
const sealUseRequestFormCompleteDB = db.collection('sealUseRequestFormComplete');

Page({
  data: {
    sealUseRequestFormDraft:[],
    sealUseRequestFormSubmittedToBeVerified:[],
    sealUseRequestFormSubmittedAllowed:[],
    sealUseRequestFormSubmittedNotAllowed:[],
    sealUseRequestFormComplete:[],
    sealArray:[],
    showDraftActionsheet: false,
    draftGroups: [
        { text: '编辑', value: 1 },
        { text: '提交审核', value: 2},
        { text: '删除', type: 'warn', value: 0 }
    ],
    showSubmittedActionsheet: false,
    submittedGroups: [
        { text: '查看', value: 1 },
    ],
    showAllowedActionsheet: false,
    allowedGroups: [
      { text: '查看', value: 1 },
      { text: '现在用章', value: 2}
    ],
    showCompleteActionsheet: false,
    completeGroups: [
      { text: '查看', value: 1 },
    ],
  },

  draftFormClick(e) {
    this.setData({
      showDraftActionsheet: true
  });
  app.globalData.selectedRequestID = e.currentTarget.id;
  console.log('app.globalData.selectedRequestID:'+app.globalData.selectedRequestID);
  },

  draftChangeOPClose(e){
    this.setData({
      showDraftActionsheet: false
    });
  },

  submittedFormClick(e) {
    this.setData({
      showSubmittedActionsheet: true
    });
  console.log(e)
  app.globalData.selectedRequestID = e.currentTarget.id;
  console.log('app.globalData.selectedRequestID:'+app.globalData.selectedRequestID);
  },  

  submittedChangeOPClose(e) {
    this.setData({
      showSubmittedActionsheet: false
    });
  },

  allowedFormClick(e) {
    this.setData({
      showAllowedActionsheet: true
    });
    console.log(e)
    app.globalData.selectedRequestID = e.currentTarget.id;
    console.log('app.globalData.selectedRequestID:'+app.globalData.selectedRequestID);
  },  

  allowedChangeOPClose(e) {
    this.setData({
      showAllowedActionsheet: false
  });
  },


  completeFormClick(e) {
    this.setData({
      showCompleteActionsheet: true
    });
  console.log(e)
  app.globalData.selectedRequestID = e.currentTarget.id;
  console.log('app.globalData.selectedRequestID:'+app.globalData.selectedRequestID);
  },  

  completeChangeOPClose(e) {
    this.setData({
      showCompleteActionsheet: false
    });
  },
  


  createForm: function (e) {
    app.globalData.selectedRequestID = 0;
    console.log('app.globalData.selectedRequestID:'+app.globalData.selectedRequestID);
    wx.navigateTo({ url: '/pages/editform/editform' })
  },

  editForm: function(e) {
    console.log('app.globalData.selectedRequestID:'+app.globalData.selectedRequestID);
    wx.navigateTo({ url: '/pages/editform/editform' })
  },

  
  completeForm: function(e) {
    var RequestID = app.globalData.selectedRequestID;
    console.log("completeForm")
    wx.cloud.callFunction({
      name: 'findForm',
      data: {selectedRequestID:RequestID},
      success: res => {
        if (!res.result.isEmpty)
        {
          var formData = res.result.data[0];
        console.log(formData)
        wx.navigateTo({
          url: '/pages/completeform/completeform',
        success: function(res){
          res.eventChannel.emit('getForm',formData)
        }})
      }
      },
      fail: err => {
        console.error('[云函数] [viewForm] 调用失败', err)
        wx.showToast({
          title:"获取表单失败",
          icon:'error',
          duration: 600
        })
      }
    })
  },

  decryptForm: function(e) {
    var RequestID = app.globalData.selectedRequestID;
    wx.cloud.callFunction({
      name: 'findForm',
      data: {selectedRequestID:RequestID},
      success: res => {
        if (!res.result.isEmpty)
        {
          var formData = res.result.data[0];
        console.log(formData)
        wx.navigateTo({
          url: '/pages/opencryptedform/opencryptedform',
        success: function(res){
          res.eventChannel.emit('getForm',formData)
        }})
      }
      },
      fail: err => {
        console.error('[云函数] [viewForm] 调用失败', err)
        wx.showToast({
          title:"获取表单失败",
          icon:'error',
          duration: 600
        })
      }
    })
  },


  viewForm: function(e) {
    var RequestID = app.globalData.selectedRequestID;
    wx.cloud.callFunction({
      name: 'findForm',
      data: {selectedRequestID:RequestID},
      success: res => {
        if (!res.result.isEmpty)
        {
          var formData = res.result.data[0];
        console.log(formData)
        wx.navigateTo({
          url: '/pages/displayform/displayform',
        success: function(res){
          res.eventChannel.emit('getForm',formData)
        }})
      }
      },
      fail: err => {
        console.error('[云函数] [viewForm] 调用失败', err)
        wx.showToast({
          title:"获取表单失败",
          icon:'error',
          duration: 600
        })
      }
    })
  },

  deleteForm:function(requestID){
    var sealUseRequestFormDraft = wx.getStorageSync('sealUseRequestFormDraft');
    console.log('删除之前'+sealUseRequestFormDraft);
    for(var i in sealUseRequestFormDraft){
        if (sealUseRequestFormDraft[i].requestID == requestID){sealUseRequestFormDraft.splice(i,1)};    
    }
    wx.setStorageSync('sealUseRequestFormDraft', sealUseRequestFormDraft);
    app.globalData.selectedRequestID = 0;
    wx.showToast({
      title:"操作成功",
      icon:'success',
      duration: 600
    })
    console.log('删除之后'+sealUseRequestFormDraft);
    this.onShow();
  },

  submitForm:function(requestID){
    if (app.globalData.logged)
    {
      var sealUseRequestFormDraft = wx.getStorageSync('sealUseRequestFormDraft');
      var myDate = new Date();
      var submitTime = myDate.toLocaleString();
      for(var i in sealUseRequestFormDraft)
      {
        if (sealUseRequestFormDraft[i].requestID == requestID){
          sealUseRequestFormSubmittedToBeVerifiedDB.add({
            data:{
              submitTime: submitTime,
              isVerified: false,
              requestID: sealUseRequestFormDraft[i].requestID,
              sealIndex: sealUseRequestFormDraft[i].sealIndex,
              reasonOfRequest: sealUseRequestFormDraft[i].reasonOfRequest,
              requestDate: sealUseRequestFormDraft[i].requestDate,
              status: "未审核"
            }
          }).then(res=>{
            wx.showToast({
              title:"提交成功",
              icon:"success",
              duration:600
            })
          })
          sealUseRequestFormDraft.splice(i,1);
        };    
    }
    wx.setStorageSync('sealUseRequestFormDraft', sealUseRequestFormDraft); 
    }
    else
    {
      wx.showToast({
        title:"请先登录",
        icon:"none",
        duration: 600
      })
    }
    app.globalData.selectedRequestID = 0;
  },

  draftChangeOPMenu:function(e){
    switch(e.detail.value){
      case 1:this.editForm();
        break;
      case 2:this.submitForm(app.globalData.selectedRequestID);
        break;
      case 0:this.deleteForm(app.globalData.selectedRequestID);
        break;
    }
    this.setData({
      showDraftActionsheet: false
  });
  },

  submittedChangeOPMenu:function(e){
    switch(e.detail.value){
      case 1:this.viewForm();
        break;
      case 2:this.submitForm(app.globalData.selectedRequestID);
        break;
      case 0:this.deleteForm(app.globalData.selectedRequestID);
        break;
    }
    this.setData({
      showSubmittedActionsheet: false
  });
  },
  
  allowedChangeOPMenu:function(e){
    switch(e.detail.value){
      case 1:this.viewForm();
        break;
      case 2:this.completeForm();
        break;
    }
    this.setData({
      showAllowedActionsheet: false
  });
  },

  completeChangeOPMenu:function(e){
    switch(e.detail.value){
      case 1:this.decryptForm();
        break;
    }
    this.setData({
      showCompleteActionsheet: false
  });
  },

  updateForm: function(){
    var sealUseRequestFormDraft = wx.getStorageSync('sealUseRequestFormDraft')||[];
    if (sealUseRequestFormDraft) {
      this.setData({ sealUseRequestFormDraft: sealUseRequestFormDraft});
    }
    if (app.globalData.logged) {
      sealUseRequestFormSubmittedToBeVerifiedDB.where({_openid:app.globalData.openid}).get().then(res=>{
        this.setData({sealUseRequestFormSubmittedToBeVerified: res.data})
      })
      sealUseRequestFormSubmittedAllowedDB.where({_openid:app.globalData.openid}).get().then(res=>{
        this.setData({sealUseRequestFormSubmittedAllowed: res.data})
      })    
      sealUseRequestFormSubmittedNotAllowedDB.where({_openid:app.globalData.openid}).get().then(res=>{
        this.setData({sealUseRequestFormSubmittedNotAllowed: res.data})
      })
      sealUseRequestFormCompleteDB.where({_openid:app.globalData.openid}).get().then(res=>{
        this.setData({sealUseRequestFormComplete: res.data})
      })
      wx.showToast({
        title:"已更新列表",
        icon:"success",
        duration: 600
      })
    }
    else
    {
      wx.showToast({
        title:"请先登录",
        icon:"none",
        duration: 600
      })
    }
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
  //  this.updateForm();
  },
})
