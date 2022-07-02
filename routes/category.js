let express = require('express');
let router = express.Router();
const db = require('../utils/db')

/*1--------添加----*/
router.post('/addCategory', async (req, res) => {
  let sql = "select * from cate where category=?"
  let resSelect = await db.queryAsync(sql, [req.body.category])
  if (resSelect.length !== 0) {
    return res.send({ flag: false, msg: '文章分类已存在啦' })
  } else {
    let sql = "insert into cate(category,status,create_time) value(?,?,?)"
    let params = [
      req.body.category,
      req.body.status,
      new Date()
    ]
    let resInsert = await db.queryAsync(sql, params)
    if (resInsert.affectedRows !== 0) {
      return res.send({ flag: true, msg: '添加文章分类成功' })
    } else {
      return res.send({ flag: false, msg: '添加文章分类失败' })
    }
  }
})

/*2---删除 */
router.delete('/delCategory/:id', async (req, res) => {
  let id = req.params.id
  let sql = "delete from cate where id=?"
  let delResult = await db.queryAsync(sql, [parseInt(id)])
  if (delResult.affectedRows !== 0) {
    return res.send({ flag: true, msg: '删除文章分类成功！' })
  } else {
    return res.send({ flag: false, msg: '删除文章分类失败！' })
  }
})

/*3---按Id获取文章信息接口----*/
router.get('/getCategoryById/:id', (req, res, next) => {
  let id = req.params.id
  let sql = "select * from cate where id=?"
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
router.put('/editCategory/:id', async (req, res) => {
  let sql = "update cate set category=?,status=? where id=?"
  let category = req.body.category,
    status = req.body.status,
    id = req.params.id
  let resUpdate = await db.queryAsync(sql, [category, status, id])
  if (resUpdate.affectedRows !== 0) {
    return res.send({ flag: true, msg: "修改文章分类信息成功！" })
  } else {
    return res.send({ flag: false, msg: "修改文章分类信息失败！" })
  }
})

/*4---获取所有文章信息，并对信息进行分页，带搜索功能的分页-*/
router.get('/getAllCategory', async (req, res) => {
  let { query, pagenum, pagesize } = req.query
  let total = 0
  if (query == '') {
    let sql = "select * from cate"
    total = (await db.queryAsync(sql, [])).length
    sql = "select * from cate limit ?,?"
    db.query(sql, [parseInt((pagenum - 1) * pagesize), parseInt(pagesize)], (err, data) => {
      if (err) {
        console.log(err)
        res.send({ flag: false, msg: '查询出错啦' })
      } else if (data.length !== 0) {
        res.send({ flag: true, msg: '查询文章分类成功', category: data, total: total })
      } else {
        res.send({ flag: true, msg: '没有数据' })
      }
    })
  } else {
    let sql = `select * from cate where category like ?`
    query = "%" + query + "%"
    console.log(query)
    total = (await db.queryAsync(sql, [query])).length
    console.log(total, 2)
    sql = `select * from cate where category like ? limit ?,?`
    db.query(sql, [query, parseInt((pagenum - 1) * pagesize), parseInt(pagesize)], (err, data) => {
      if (err) {
        console.log(err)
        res.send({ flag: false, msg: '查询出错2' })
      } else if (data.length !== 0) {
        res.send({ flag: true, msg: '查询文章分类列表成功', category: data, total: total })
      } else {
        res.send({ flag: true, msg: '没有一个数据' })
      }
    })
  }
})

module.exports = router;