const app = getApp()

Page({
  data: {
    loading: false,
    load_error: false,
    msg: '读取中',

    s_view_height: 0,
    screen_fill_height: 0,
    refreshing: false
  },
  
  updatePage: function () {
    
  },

  onLoad: function (options) {
    // set the height of the friend list
    let that = this
    let query = wx.createSelectorQuery().in(this)
    query.select('.friend-conainer').boundingClientRect(function (res) {
      //在这里做计算，res里有需要的数据
      that.setData({
        s_view_height: app.globalData.sys_info.windowHeight - res.height
      })
    }).exec()

    this.updatePage()
  },

  scrollToUpper: function (e) {
    if (!this.data.refreshing) {
      wx.vibrateShort()

      this.setData({
        refreshing: true
      })

      this.updatePage(true)
    }
  }
})