const app = getApp()

Page({
  data: {
    loading: true,
    load_error: false,
    msg: '读取中',
    year: app.utility.getCurrentYearMonth().year,
    month: app.utility.getCurrentYearMonth().month,
    history: [],
    no_history: false,
    disable_nav_btn: false,
    s_view_height: 0
  },

  goToArticle: function (e) {
    app.utility.goToArticle(app, e.currentTarget.dataset.id)
  },

  monthBack: function () {
    if (this.data.month === 1) {
      this.setData({
        year: this.data.year - 1,
        month: 12
      })
    } else {
      this.setData({
        month: this.data.month - 1
      })
    }

    this.updatePage()
  },

  monthNext: function () {
    let current = app.utility.getCurrentYearMonth()
    let doUpdate = true

    let target_year = this.data.year
    let target_month = this.data.month

    if (target_month === 12) {
      target_year = target_year + 1
      target_month = 1
    } else {
      target_month = target_month + 1
    }

    if ((target_year > current.year) || (target_year === current.year && target_month > current.month)) {
      target_year = current.year
      target_month = current.month
      doUpdate = false
    }

    this.setData({
      year: target_year,
      month: target_month
    })    
    
    if (doUpdate) {
      this.updatePage()
    }
  },
  
  getKey: function (year, month) {
    return 'Y' + year + 'M' + month
  },

  getLocaReadHistorylData: function () {
    let key = this.getKey(this.data.year, this.data.month)
    let check = app.utility.getCachedData('read_history', key)
    return check
  },

  saveLocaReadHistorylData: function (data) {
    let key = this.getKey(this.data.year, this.data.month)
    app.utility.saveCachedData('read_history', key, data)
  },

  removeCurrentMonthData: function () {
    let current = app.utility.getCurrentYearMonth()
    let key = this.getKey(current.year, current.month)
    
    app.utility.removeCachedData('read_history', key)
  },

  cleanReadHistoryData: function (data) {
    const score_h = 85
    const score_l = 60

    // prepare the score classes and id
    let rtn = []

    for (let i = 0; i < data.length; i++) {
      let t = data[i].title
      let s = data[i].score
      let d = new Date(data[i].date)

      let s_class
      if (s < score_l) {
        s_class = 'record-l'
      } else if (s >= score_h) {
        s_class = 'record-h'
      } else {
        s_class = 'record-m'
      }

      if (i === data.length - 1) {
        s_class = s_class + ' menu-bottom-margin-l'
      }

      rtn.push({
        article_id: data[i].article_id,
        day: d.getDate(),
        title: t,
        score: s,
        score_class: s_class
      })
    }
    
    return rtn
  },

  renderReadHistory: function (data) {
    let history = this.cleanReadHistoryData(data)
    let no_history = false

    if (history.length === 0) {
      no_history = true
    }

    this.setData({
      history: history,
      no_history: no_history,
      loading: false,
      disable_nav_btn: false
    })
  },

  loadReadHistory: function() {
    // get start end date for the given month
    let dt_rng = app.utility.getMonthStartEndDate(this.data.year, this.data.month)
    
    app.db.collection('reading_records').where({
      _openid: app.globalData.openid,
      date: app.db_cmd.gte(dt_rng.start).and(app.db_cmd.lte(dt_rng.end))
    }).orderBy('date', 'asc').get({
      success: res => {
        console.log(res)
        let data = res.data
        this.saveLocaReadHistorylData(data)
        
        // push the read history
        this.renderReadHistory(data)
      },

      fail: err => {
        this.setData({
          disable_nav_btn: false,
          load_error: true,
          msg: '读取错误'
        })
      }
    })
  },

  updatePage: function () {
    this.setData({
      loading: true,
      load_error: false,
      msg: '读取中',

      no_history: false,
      disable_nav_btn: false
    })

    // check if has got data
    let check = this.getLocaReadHistorylData()

    if (!check.has_data) {
      this.loadReadHistory()
    } else {
      // push the read history
      this.renderReadHistory(check.data)
    }
  },

  onLoad: function (options) {
    let that = this
    let query = wx.createSelectorQuery().in(this)
    query.select('.month-picker-conainer').boundingClientRect(function (res) {
      //在这里做计算，res里有需要的数据
      that.setData({
        s_view_height: app.globalData.sys_info.windowHeight - res.height
      })
    }).exec()

    this.removeCurrentMonthData()
    this.updatePage()
  },

  onUnload: function () {
    // always remove the current month cache to make sure that latest record got updated
    this.removeCurrentMonthData()
  },

  reload: function () {
    this.updatePage()
  }
})