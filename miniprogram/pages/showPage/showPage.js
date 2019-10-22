const app = getApp()

Page({
  data: {
    loading: true,
    load_error: false,
    msg: '读取中',

    numDays: 0,
    numArticles: 0,
    numWords: 0,
    numQuestions: 0,
    avgScores: 0,
    refDate: '2019/01/01',
    badgeURL: '',
    openid: ''
  },

  updatePage: function() {
    // init updating display
    this.setData({
      loading: true
    })

    // call the cloud function to update
    wx.cloud.callFunction({
      name: 'showStats',
      data: {
        openid: this.data.openid
      },
      success: res => {
        const showStats = res.result
        
        let url = '../../images/showPageImages/lazy.png'

        switch (showStats.numDays) {
          case 0:
            url = '../../images/showPageImages/lazy.png'
            break
          case 1:
            url = '../../images/showPageImages/bronze.png'
            break
          case 2:
            url = '../../images/showPageImages/silver.png'
            break
          case 3:
            url = '../../images/showPageImages/silver.png'
            break
          case 4:
            url = '../../images/showPageImages/gold.png'
            break
          case 5, 6, 7:
            url = '../../images/showPageImages/trophy.png'
            break
        }

        this.setData({
          loading: false,
          
          numDays: showStats.numDays,
          numArticles: app.utility.getStatsNumString(showStats.numArticles),
          numWords: app.utility.getStatsNumString(showStats.numWords),
          numQuestions: app.utility.getStatsNumString(showStats.numQuestions),
          avgScores: app.utility.getStatsNumString(showStats.avgScores),

          badgeURL: url
        })
      },

      fail: err => {
        this.setData({
          load_error: true,
          msg: '读取错误'
        })
      }
    })
  },

  onLoad: function (options) {
    this.setData({
      openid: options.who
    })

    this.updatePage()
  }
})