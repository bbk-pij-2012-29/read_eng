// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'production-4m7fg'
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const article = await db.collection('article').where({
    article_id: event.article_id
  }).get()

  const article_content = await db.collection('article_content').where({
    article_id: event.article_id
  }).get()
  
  const article_data = article.data[0]
  const article_content_data = article_content.data[0]

  return {
    event,
    article_data,
    article_content_data
  }
}