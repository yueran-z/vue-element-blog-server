let express = require('express');
let router = express.Router();
const db = require('../utils/db')

const fs = require('fs');

/*1--------添加----*/
router.post('/addArticle', async (req, res) => {
  let sql = "select * from article where title=?"
  let resSelect = await db.queryAsync(sql, [req.body.title])
  if (resSelect.length !== 0) {
    return res.send({ flag: false, msg: '文章标题已存在啦' })
  } else {
    let sql = "insert into article(title,summary,content,cate_id,create_time) value(?,?,?,?,?)"
    let params = [
      req.body.title,
      req.body.summary,
      req.body.content,
      req.body.cate_id,
      new Date()
    ]
    let resInsert = await db.queryAsync(sql, params)
    if (resInsert.affectedRows !== 0) {
      return res.send({ flag: true, msg: '添加文章成功' })
    } else {
      return res.send({ flag: false, msg: '添加文章失败' })
    }
  }
})

/*2---删除 */
router.delete('/delArticle/:id', async (req, res) => {
  let id = req.params.id
  let sql = "delete from article where id=?"
  let delResult = await db.queryAsync(sql, [parseInt(id)])
  if (delResult.affectedRows !== 0) {
    return res.send({ flag: true, msg: '删除文章成功！' })
  } else {
    return res.send({ flag: false, msg: '删除文章失败！' })
  }
})

/*3---按Id获取文章信息接口----*/
router.get('/getArticleById/:id', (req, res, next) => {
  let id = req.params.id
  let sql = "select * from article where id=?"
  db.query(sql, [id], (err, data) => {
    if (err) {
      res.send({ flag: false, msg: '查询出错' })
    } else if (data.length !== 0) {
      res.send({ flag: true, msg: '查询成功', data: data })
    } else {
      res.send({ flag: true, msg: '没有这个数据' })
    }
  })
})
/*3----修改文章*/
router.put('/editArticle/:id', async (req, res) => {
  let sql = "update article set title=?,summary=?,content=?,cate_id=? where id=?"
  let title = req.body.title,
    summary = req.body.summary,
    content = req.body.content,
    cate_id = req.body.cate_id,
    id = req.params.id
  let resUpdate = await db.queryAsync(sql, [title, summary, content, cate_id, id])
  if (resUpdate.affectedRows !== 0) {
    return res.send({ flag: true, msg: "修改文章信息成功！" })
  } else {
    return res.send({ flag: false, msg: "修改文章信息失败！" })
  }
})

/*4---获取所有文章信息，并对信息进行分页，带搜索功能的分页-*/
router.get('/getAllArticle', async (req, res) => {
  let { query, pagenum, pagesize } = req.query
  let total = 0
  if (query == '') {
    let sql = "select * from article"
    total = (await db.queryAsync(sql, [])).length
    sql = "select * from article limit ?,?"
    db.query(sql, [parseInt((pagenum - 1) * pagesize), parseInt(pagesize)], (err, data) => {
      if (err) {
        console.log(err)
        res.send({ flag: false, msg: '查询出错啦' })
      } else if (data.length !== 0) {
        res.send({ flag: true, msg: '查询文章列表成功', articles: data, total: total })
      } else {
        res.send({ flag: true, msg: '没有数据' })
      }
    })
  } else {
    let sql = `select * from article where title like ?`
    query = "%" + query + "%"
    console.log(query)
    total = (await db.queryAsync(sql, [query])).length
    console.log(total, 2)
    sql = `select * from article where title like ? limit ?,?`
    db.query(sql, [query, parseInt((pagenum - 1) * pagesize), parseInt(pagesize)], (err, data) => {
      if (err) {
        console.log(err)
        res.send({ flag: false, msg: '查询出错2' })
      } else if (data.length !== 0) {
        res.send({ flag: true, msg: '查询用户列表成功', articles: data, total: total })
      } else {
        res.send({ flag: true, msg: '没有一个用户2' })
      }
    })
  }
})


//富文本图片删除
router.get('/delImage', (req, res) => {
  let url = (req.query[0]).split('/')
  console.log(url);//拿到绝对路径req.query[0],通过FS模块删除它
  let path = [url.length - 2] + '/' + url[url.length - 1]
  if (req.query[0]) {
    fs.unlink(`./public/article/${path}`, err => {
      if (err) {
        console.log(err);
        return
      } else {
        res.send({ flag: true, msg: "删除成功" })
      }
    })
  }
})
module.exports = router;