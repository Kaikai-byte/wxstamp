var app = getApp();
const sm = require('../../miniprogram_npm/miniprogram-sm-crypto/index');
const sm2 = require('../../miniprogram_npm/miniprogram-sm-crypto/index').sm2

Page({

  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    isAdmin:null,
    openid:null,
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

  navigateSMCrypto: function() {
    wx.navigateTo({ url: '/pages/smcrypto/smcrypto' })
  },

  navigateCompleteForm: function() {
    wx.navigateTo({ url: '/pages/completeform/completeform' })
  },

  navigateOpenCryptedForm: function() {
    wx.navigateTo({ url: '/pages/opencryptedform/opencryptedform' })
  },


  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      app.globalData.logged = true;
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
        wx.showToast({
          title:"欢迎回来，"+this.data.userInfo.nickName,
          icon:'success',
          duration: 600
        })
      },
      fail: err => {
        console.error('[云函数] [amIAdmin] 调用失败', err)
        wx.hideLoading({
          success: (res) => {},
        })
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