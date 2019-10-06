//app.js
App({
  onLaunch: function () {
    const that = this

    // utility functions
    this.utility = {
      getDateString: function (dt) {
        return dt.getFullYear() + '-'
          + dt.getMonth() + '-'
          + dt.getDate() + '-'
          + dt.getHours() + '-'
          + dt.getMinutes() + '-'
          + dt.getSeconds()
      },

      getDateFromString: function (dtStr) {
        let dtStrArray = dtStr.split('-')
        let y = parseInt(dtStrArray[0])
        let m = parseInt(dtStrArray[1])
        let d = parseInt(dtStrArray[2])
        let h = parseInt(dtStrArray[3])
        let mm = parseInt(dtStrArray[4])
        let s = parseInt(dtStrArray[5])

        return new Date(y, m, d, h, mm, s);
      },

      getCurrentMonday: function () {
        let td = new Date()
        td.setHours(0, 0, 0, 0)
        let day = td.getDay()
        let diff = td.getDate() - day + (day == 0 ? - 6 : 1)
        return {
          monday: new Date(td.setDate(diff)),
          td_day: day
        }
      },

      getCurrentYearMonth: function () {
        let td = new Date()
        return {
          year: td.getFullYear(),
          month: td.getMonth() + 1
        }
      },

      getMonthStartEndDate: function (year, month) {
        let startDate = new Date(year, month - 1, 1)

        // in case of the december
        if (month === 11) {
          year = year + 1
          month = 0
        }

        let endDate = new Date(year, month, 1)
        endDate.setDate(endDate.getDate() - 1)

        endDate.setHours(23)
        endDate.setMinutes(59)
        endDate.setSeconds(59)

        return {
          start: startDate,
          end: endDate
        }
      },

      getCachedData: function (local_collection_name, key) {
        try {
          let check = wx.getStorageSync(local_collection_name + '_' + key)
          if (check) {
            return {
              has_data: true,
              data: check
            }
          }
          else {
            return {
              has_data: false
            }
          }
        } catch (e) {
          return {
            has_data: false
          }
        }
      },

      saveCachedData: function (local_collection_name, key, data) {
        wx.setStorage({
          key: local_collection_name + '_' + key,
          data: data
        })
      },

      removeCachedData: function (local_collection_name, key) {
        wx.removeStorage({
          key: local_collection_name + '_' + key
        })
      },

      getStatsNumString: function (num) {
        let tail = ''

        if (num > 1000) {
          num = num / 1000
          tail = 'K'
          num = num.toFixed(1)
        } else {
          num = Math.round(num)
        }

        return num + tail
      },

      goToArticle: function (app, article_id, isAdv) {
        // type can only be article or adv in lower case
        // defined by the cloud function and article page
        let type = 'article'

        if (isAdv) {
          let type = 'adv'
        }

        let expire_date = null
        const today = new Date()
        
        if (app.globalData.expire_date === null) {
          // get the expire date first
          app.db.collection('account').where({
            _openid: app.globalData.openid
          }).get({
            success: res => {
              app.globalData.expire_date = res.data[0].expire_date

              expire_date = new Date(res.data[0].expire_date.toDateString())

              // make sure it's only date not time
              if (expire_date >= new Date(today.toDateString())) {
                app.globalData.selected_article_id = parseInt(article_id)

                wx.navigateTo({
                  url: '../article/article?type=' + type + '&id=' + article_id
                })
              } else {
                wx.navigateTo({
                  url: '../payment/payment'
                })
              }
            },
            fail: err => {
              console.log(err)
            }
          })
        } else {
          expire_date = new Date(app.globalData.expire_date.toDateString())

          // make sure it's only date not time
          if (expire_date >= new Date(today.toDateString())) {
            app.globalData.selected_article_id = parseInt(article_id)

            wx.navigateTo({
              url: '../article/article?type=' + type + '&id=' + article_id
            })
          } else {
            wx.navigateTo({
              url: '../payment/payment'
            })
          }
        }
      }

    }

    // global data
    this.globalData = {
      // initial eng level
      sys_info: wx.getSystemInfoSync(),

      eng_level_list: [
        '三年级', '四年级', '五年级', '六年级',
        // '初一', '初二', '初三', '高一', '高二', '高三',
        // '大一', '大二', '大三', '大四', '出国留学'
      ],

      category_tags: [{
        "tag": "all",
        "tag_cn": "全部"
      },

      {
        "tag": "story",
        "tag_cn": "故事"
      },

      {
        "tag": "non_fiction",
        "tag_cn": "科普"
      },

      {
        "tag": "news",
        "tag_cn": "新闻"
      }],

      interest_tags: [{
        "tag": "adventure",
        "tag_cn": "探险",
        "img": "../../images/int_icons/adventure.png"
      },

      {
        "tag": "animal",
        "tag_cn": "动物",
        "img": "../../images/int_icons/animal.png"
      },

      {
        "tag": "art",
        "tag_cn": "艺术",
        "img": "../../images/int_icons/art.png"
      },

      {
        "tag": "fantasy",
        "tag_cn": "奇幻",
        "img": "../../images/int_icons/fantasy.png"
      },

      {
        "tag": "friendship",
        "tag_cn": "朋友",
        "img": "../../images/int_icons/friendship.png"
      },

      {
        "tag": "food",
        "tag_cn": "美食",
        "img": "../../images/int_icons/food.png"
      },

      {
        "tag": "game",
        "tag_cn": "游戏",
        "img": "../../images/int_icons/game.png"
      },

      {
        "tag": "geography",
        "tag_cn": "地理",
        "img": "../../images/int_icons/place.png"
      },

      {
        "tag": "health",
        "tag_cn": "健康",
        "img": "../../images/int_icons/health.png"
      },

      {
        "tag": "music",
        "tag_cn": "音乐",
        "img": "../../images/int_icons/music.png"
      },

      {
        "tag": "nature",
        "tag_cn": "自然",
        "img": "../../images/int_icons/nature.png"
      },

      {
        "tag": "science",
        "tag_cn": "科学",
        "img": "../../images/int_icons/science.png"
      },

      {
        "tag": "history",
        "tag_cn": "历史",
        "img": "../../images/int_icons/history.png"
      },

      {
        "tag": "space",
        "tag_cn": "宇宙",
        "img": "../../images/int_icons/space.png"
      },

      {
        "tag": "sport",
        "tag_cn": "运动",
        "img": "../../images/int_icons/sport.png"
      },

      {
        "tag": "tale",
        "tag_cn": "童话",
        "img": "../../images/int_icons/fairy.png"
      },

      {
        "tag": "travel",
        "tag_cn": "旅行",
        "img": "../../images/int_icons/travel.png"
      }],

      // only when first time launching or any update to the read_stats
      reloadUserPage: true,
      reloadHomePage: false,
      read_stats: null,

      // initialize it to 0
      selected_article_id: 0,
      selected_article_title: '',

      expire_date: null,
      account_id: null,

      // network status check
      // lastNetworkStatus: true 
    }

    // start listen to the network status
    // wx.onNetworkStatusChange(function (res) {
    //   that.globalData.lastNetworkStatus = res.isConnected

    //   if (!res.isConnected) {

    //     // go to no network error page
    //     // page to provide retry button
    //   }
    // })

    // clear cache
    wx.clearStorage()

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'production-4m7fg'
      })
    }
    
    this.db = wx.cloud.database()
    this.db_cmd = this.db.command

    try {
      wx.removeStorageSync("selected_interest_id")
    } catch(e) {
      console.log(e)
    }

    
  }
})