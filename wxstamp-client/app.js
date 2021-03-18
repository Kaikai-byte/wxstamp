const app = getApp()
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
  },
  globalData: {
    sealArray:['A部门印章一','A部门印章二','A部门印章三','B部门印章一','B部门印章二'],
    selectedRequestID:0,
    openid:null,
    avatarUrl:null,
    userInfo:null,
    isAdmin:false,
    logged:false
  }
})
