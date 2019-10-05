// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'production-4m7fg'
})

const db = cloud.database()
const _ = db.command

function getCurrentMonday () {
  let td = new Date()
  td.setHours(0, 0, 0, 0)
  let day = td.getDay()
  let diff = td.getDate() - day + (day == 0 ? - 6 : 1)
  return {
    monday: new Date(td.setDate(diff)),
    td_day: day
  }
}

function getDateString (dt) {
  return dt.getFullYear() + '-'
    + dt.getMonth() + '-'
    + dt.getDate() + '-'
    + dt.getHours() + '-'
    + dt.getMinutes() + '-'
    + dt.getSeconds()
}

function getNumReadDay (read_hist_data, td) {
  if (td === 0) {
    td = 7
  }

  const cn_week = ['一', '二', '三', '四', '五', '六', '日']
  let default_week = []

  for (let i = 0; i < 7; i++) {
    default_week.push({
      id: (i + 1),
      date: cn_week[i],
      cls_dt: '',
      cls_star: ''
    })
  }

  // mark today
  default_week[td - 1].date = '今日'
  default_week[td - 1].cls_dt = 'today'

  // mark stars
  let last_d = 0
  let count_d = 0

  for (const dt of read_hist_data) {
    let d = new Date(dt.date).getDay()
    if (last_d !== d) {
      default_week[d - 1].cls_star = 'star-active'
      count_d = count_d + 1
      last_d = d
    }
  }

  return {
    week_read_num: count_d,
    week: default_week
  }
}

// 云函数入口函数
// the function takes openid
// {
//   openid: string
// }
// returns the show page stats
exports.main = async (event, context) => {
  const openid = event.openid
  const monday = getCurrentMonday()
  const mondayStr = getDateString(monday.monday)

  // get the weekly read stats
  const res = await cloud.callFunction({
    name: 'getWeekly',
    data: {
      openid: openid,
      start_date: mondayStr
    }
  })

  // summarise the weekly days
  const num_read_day = getNumReadDay(res.result.data, monday.td_day)

  // get read stats
  const statsRes = await db.collection('read_stats').where({
    _openid: openid
  }).get()

  const statsData = statsRes.data

  return {
    event, num_read_day, statsData
  }
}