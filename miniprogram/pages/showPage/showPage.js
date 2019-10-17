const app = getApp()

Page({
  data: {
    loading: false,
    load_error: false,
    msg: '读取中',

    openid: ''
  },

  updatePage: function() {

  },

  onLoad: function (options) {
    this.setData({
      openid: options.who
    })
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  reload: function () {
    this.updatePage()
  }
})