let express = require('express');
let router = express.Router();

const db = require('../utils/db');
const multer = require('multer');
const fs = require('fs');
const moment = require('moment')


const path = require('path');

// 任意类型文件上传
router.post("/uploadFile", (req, res) => {
  const upload = multer({
    // limits: {
    //   // 10 * 1000 是 10 kb
    //   fileSize: 100 * 100000
    // },
    storage: multer.diskStorage({
      // destination: 'upload', //string时,服务启动将会自动创建文件夹
      destination: function (req, file, cb) {
        cb(null, './public/uploadFiles/');
      },
      filename: function (req, file, cb) {
        // 获取文件后缀名
        var ext = path.extname(file.originalname)
        // 设置名字
        var changedName = (new Date().getTime()) + '-' + Math.floor(Math.random() * 100000000000000) + ext;
        cb(null, changedName);
      }
    })
  }).single('file');
  // 这个file 是指定 返回在 req 里面的对象 req.file 来访问
  upload(req, res, (err) => {
    // 判断图片大小 如果超过 定值则不让用
    if (err == undefined) {
      FileName = req.file.filename.split('\\').join('/');
      // const FilePath = path.join(__dirname, "../", "../", "../", "uploadFiles", FileName)
      res.send({
        msg: 'ojbk!',
        data: {
          url: `http://127.0.0.1:3000/uploadFiles/${FileName}`,
        }
      })
    } else {
      res.send({
        msg: "NoOjbk!",
        err: err
      })
    }
  })
})






//头像上传------------------
let uploadDir = `./public/upload/${moment().format('YYYYMMDD')}`
fs.mkdirSync(uploadDir, {
  recursive: true
})   //创建上传的文件夹

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})  //配置本地存储并对上传文件重命名

let upload = multer({
  storage: storage
}).array('file')  //上传表单的name属性的值


router.post('/', function (req, res, next) {
  console.log('bb')
  upload(req, res, function (err) {
    if (err) {
      console.log(err)
      return;
    } else {
      let imgPath = [];
      req.files.forEach(function (i) {
        console.log('aaa', i)
        imgPath.push((i.path).replace('public\\', ''))
      })// [a,b]  a,b    /images/a.jpg    /css/a.css
      imgPath = imgPath.toString();
      // console.log(imgPath)
      let sql = ''
      /* if(req.auth.username&&req.auth.username==req.body.username){
           sql=`update user set photo=? where username='${req.auth.username}'`
       }else if(req.body.id){
           sql=`update user set photo=? where id=${req.body.id}`
       }else{
           sql=`update user set photo=? where username='${req.auth.username}'`
       }*/
      let username = req.body.username
      let authUsername = req.auth.username
      if (username == authUsername) {
        sql = `update user set photo=? where username='${authUsername}'`
      } else {
        sql = `update user set photo=? where username='${username}'`
      }
      db.query(sql, [imgPath], function (err, result) {
        if (err) {
          console.log(err);
          return
        } else {
          res.send({ flag: true, msg: '上传成功', avatar: imgPath, url: 'http://127.0.0.1:3000/' + imgPath })
        }
      })
    }
  })
})

router.post("/up", (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      //console.log(req.body)
      let sql = 'insert into article(title,content) values (?,?)'
      db.query(sql, [req.body.title, req.body.richcontent], function (err, result) {
        if (err) {
          console.log(err);
          return;
        } else {
          res.json(result)
        }
      })
    }
  });
})
router.get('/list', function (req, res, next) {
  let sql = "select * from article"
  db.query(sql, null, function (err, result) {
    if (err) {
      console.log(err);
      return;
    } else {
      res.json(result)
    }
  })
});

router.get('/article/:id', function (req, res, next) {
  let id = req.params.id;
  let sql = "select * from article where id=?"
  db.query(sql, [id], function (err, result) {
    if (err) {
      console.log(err);
      return;
    } else {
      res.json(result)
    }
  })
})
module.exports = router;
