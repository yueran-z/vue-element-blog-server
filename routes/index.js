var express = require('express');
var router = express.Router();
const db=require('../utils/db')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/a', function(req, res) {
  res.send('i am a beautiful butterfly a');
  console.log("this gets executed a");
});
router.get('/b', function(req, res) {
  return res.send('i am a beautiful butterfly b');
  console.log("this gets executed b");
});
router.get('/menu',(req, res, next) => {
  let sql="select * from menu"
  db.query(sql,[],(err,data)=>{
    if(err){
      res.send({flag: false, msg: '查询出错'})
    }else if(data.length!==0){
      res.send({flag: true,data:data,userInfo:req.auth})
    }
  })
})
module.exports = router;
