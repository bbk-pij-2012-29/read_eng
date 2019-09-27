// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'production-4m7fg'
})

const db = cloud.database()
const _ = db.command

function getDateFromString(dtStr) {
  let dtStrArray = dtStr.split('-')
  let y = parseInt(dtStrArray[0])
  let m = parseInt(dtStrArray[1])
  let d = parseInt(dtStrArray[2])
  let h = parseInt(dtStrArray[3])
  let mm = parseInt(dtStrArray[4])
  let s = parseInt(dtStrArray[5])

  return new Date(y, m, d, h, mm, s);
}

// 云函数入口函数
// the function takes openid 
// {
//   openid: string
// }
// returns the week stats and the number of reading days
exports.main = async (event, context) => {
  const max_limit = 100

  const start_date = getDateFromString(event.start_date)

  const countRecords = await db.collection('reading_records').where({
    _openid: event.openid,
    date: _.gte(start_date)
  }).count()

  const totalRecords = countRecords.total

  const batchTimes = Math.ceil(totalRecords / max_limit)

  // create the promise queue to avoid the 20 seconds time out
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('reading_records').where({
      _openid: event.openid,
      date: _.gte(start_date)
    }).skip(i * max_limit).limit(max_limit).get()

    tasks.push(promise)
  }
  
  // async getting promise data back
  weeklyRecords = (await Promise.all(tasks)).reduce((acc, cur) => {
    acc.data.concat(cur.data)
  })

  let data = weeklyRecords.data

  return {
    event, data
  }
}