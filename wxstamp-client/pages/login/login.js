var app = getApp();
const sm = require('../../miniprogram_npm/miniprogram-sm-crypto/index');
const sm2 = sm.sm2

Page({

  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    isAdmin:null,
    openid:null,
    pubKey:null,
    uploadPubKey:false
  },

  onLaunch: function () {


    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
              console.log(userInfo)
            }
          })
        }
      }
    })
  },
  onGetUserInfo: function(e) {
    if (!app.globalData.logged && e.detail.userInfo) {
      this.setData({
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }

  },
  onLogOut: function(e){
    if (app.globalData.logged){
      this.setData({
        logged:false
      })
      app.globalData.logged = false;
      app.globalData.openid = null;
      app.globalData.avatarUrl = null;
      app.globalData.userInfo = null;
      app.globalData.isAdmin = false;
      app.globalData.pubKey = null;
      app.globalData.privKey = null;
      wx.showToast({
        title:"退出登录",
        icon:'success',
        duration: 600
      })
    }
  },
  onGetOpenid: function(e) {
    // 调用云函数
    this.onGetUserInfo(e);
    wx.showLoading({
      title: '正在登录',
    })
    var publicKey;
    var privateKey;
    
    let keypair = sm2.generateKeyPairHex()

    publicKey = keypair.publicKey
    privateKey = keypair.privateKey
    console.log(publicKey)
    console.log(privateKey)
    this.setData({
      pubKey:publicKey,
    })
    app.globalData.pubKey = publicKey,
    app.globalData.privKey = privateKey,
    
    wx.cloud.callFunction({
      name: 'login',
      data: {'publicKey':publicKey},
      success: res => {
        console.log('[云函数] [login]:', res.result.isAdmin, res.result.openid)
        if (res.result.isAdmin){
          this.setData({isAdmin : '是'})
        }
        else{
          this.setData({isAdmin : '否'})
        }
        app.globalData.isAdmin = res.result.isAdmin;
        app.globalData.openid = res.result.openid;
        this.setData({
          openid:app.globalData.openid
        })
        wx.hideLoading({
          success: (res) => {},
        })
        this.setData({
          logged:true,
          uploadPubKey:'是'
        })
        app.globalData.logged = true;
        wx.showToast({
          title:"欢迎回来",
          icon:'success',
          duration: 600
        })
      },
      fail: err => {
        console.error('[云函数] [amIAdmin] 调用失败', err)
        wx.hideLoading({
          success: (res) => {},
        })
        this.setData({
          logged:false,
          uploadPubKey:'否'
        })
        app.globalData.logged = false;
        wx.showToast({
          title:"获取openid失败",
          icon:'error',
          duration: 600
        })
      }
    })
  },

  onShow:function(){

  }
})