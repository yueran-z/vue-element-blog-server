var express = require('express');
var router = express.Router();
const db=require('../utils/db')
const jwt=require('jsonwebtoken')
const config=require('../utils/config')

/* GET users listing.  1 用户注册接口--- */
router.post('/reg',
  (req, res, next)=> {
    if(!req.body.username){
      return res.send({flag:false,msg:'用户名不能为空'})
    }else if(!req.body.password){
      return res.send({flag:false,msg:'密码不能为空'})
    }
    next()
  },
  async (req, res, next) => {
   let sql="select * from user where username=?"
   let resSelect=await db.queryAsync(sql,[req.body.username])
    if(resSelect.length!==0){
      res.send({flag:false,msg:'此账号已经存在'})
    }else{
      let sql="insert into user(username,photo,password,mobile,email,status,create_time) value(?,?,?,?,?,?,?)"
      let params=[
          req.body.username,
          'images/photo.webp',
          req.body.password,
          req.body.mobile,
          req.body.email,
          0,
          new Date()
      ]
      let resInsert=await db.queryAsync(sql,params)
      if(resInsert.affectedRows!==0){
          res.send({flag:true,msg:'注册成功'})
      }else{
          res.send({flag:false,msg:'注册失败'})
      }
    }
  }
);

/* 2--用户登录接口-*/
router.post('/login',async (req, res, next) => {
    console.log('aaa'+ req.auth)
    console.log(4)
    let sql = "select * from user where username=? and password=?"
    let params = [
        req.body.username,
        req.body.password
    ]
    let resSelect = await db.queryAsync(sql, params)
    if (resSelect.length !== 0) {
        console.log(5)
        const tokenStr=jwt.sign({username:req.body.username},config.secretKey,{expiresIn:config.expiresIn,algorithm:'HS256'})
        console.log('cc'+tokenStr)

        res.send({flag: true, msg: '登录成功',token:'Bearer '+tokenStr})
    } else {
        res.send({flag: false, msg: '登录失败'})
    }
  }
)
/*3---按Id获取用户信息接口----*/
router.get('/getUserById/:id', (req, res, next) => {
    let id=req.params.id
    let sql="select * from user where id=?"
    db.query(sql,[id],(err,data)=>{
        if(err){
            res.send({flag: false, msg: '查询出错'})
        }else if(data.length!==0){
            res.send({flag: true, msg: '查询成功',data:data})
        }else {
            res.send({flag: true, msg: '没有这个用户'})
        }
    })
})

/*4---获取所有用户信息，并对信息进行分页，带搜索功能的分页-*/
/*router.get('/getAllUser',async (req, res) => {
    console.log(req.query)
    let pagenum=parseInt(req.query.pagenum)
    let pagesize=parseInt(req.query.pagesize)
    let sql="select * from user"
    let total=(await db.queryAsync(sql,[])).length
    if(total==0){
        res.send({flag:false,msg:'用户数量为0'})
    }else{
        let sql="select * from user limit ?,?"
        db.query(sql,[(pagenum-1)*pagesize,pagesize],(err,data)=>{
            if(err){
                console.log(err)
                res.send({flag: false, msg: '查询出错'})
            }else if(data.length!==0){
                res.send({flag: true, msg: '查询用户列表成功',users:data, total:total})
            }else{
                res.send({flag: true, msg: '没有一个用户'})
            }
        })
    }
})*/
/*4---获取所有用户信息，并对信息进行分页，带搜索功能的分页-*/
router.get('/getAllUser',async (req, res) => {
    // console.log(req.auth)
    let {query,pagenum,pagesize}=req.query
    let total=0
   if(query==''){
       let sql="select * from user"
       total=(await db.queryAsync(sql,[])).length
       sql="select * from user limit ?,?"
       db.query(sql,[parseInt((pagenum-1)*pagesize),parseInt(pagesize)],(err,data)=>{
           if(err){
               console.log(err)
               res.send({flag: false, msg: '查询出错1'})
           }else if(data.length!==0){
               res.send({flag: true, msg: '查询用户列表成功',users:data, total:total})
           }else{
               res.send({flag: true, msg: '没有一个用户1'})
           }
       })
   }else{
       let sql=`select * from user where username like ?`
       query="%"+query+"%"
       console.log(query)
       total=(await db.queryAsync(sql,[query])).length
       console.log(total,2)
        sql=`select * from user where username like ? limit ?,?`
       db.query(sql,[query,parseInt((pagenum-1)*pagesize),parseInt(pagesize)],(err,data)=>{
           if(err){
               console.log(err)
               res.send({flag: false, msg: '查询出错2'})
           }else if(data.length!==0){
               res.send({flag: true, msg: '查询用户列表成功',users:data, total:total})
           }else{
               res.send({flag: true, msg: '没有一个用户2'})
           }
       })
   }
})

/*5--------用户信息添加API----*/
router.post('/addUser',async (req,res)=>{
    let sql="select * from user where username=?"
    let resSelect=await db.queryAsync(sql,[req.body.username])
    if(resSelect.length!==0){
       return res.send({flag:false,msg:'此用户已经存在'})
    }else{
        let sql="insert into user(username,photo,password,mobile,email,status,create_time) value(?,?,?,?,?,?,?)"
        let params=[
            req.body.username,
            'images/photo.webp',
            req.body.password,
            req.body.mobile,
            req.body.email,
            0,
            new Date()
        ]
        let resInsert=await db.queryAsync(sql,params)
        if(resInsert.affectedRows!==0){
           return res.send({flag:true,msg:'添加用户成功'})
        }else{
           return res.send({flag:false,msg:'添加用户失败'})
        }
    }
})


/*6----修改用户的API*/
router.put('/editUser/:id',async (req, res) => {
    /*console.log(req.params.id)  获取id的值
    console.log(req.query) 获取get请求的值
    console.log(req.body) 获取post put请求的值
    */

    let sql="update user set mobile=?,email=? where id=?"
    let mobile=req.body.mobile,email=req.body.email,id=req.params.id
    let resUpdate=await db.queryAsync(sql,[mobile,email,id])
    //console.log(resUpdate.affectedRows)
    if(resUpdate.affectedRows!==0){
      return res.send({flag:true,msg:"修改用户信息成功！"})
    }else{
        return res.send({flag:false,msg:"修改用户信息失败！"})
    }
})
/*7---删除用户API */
router.delete('/delUser/:id',async (req, res) => {
    // console.log(req.params)
    let id=req.params.id
    let sql="delete from user where id=?"
    let delResult=await db.queryAsync(sql,[parseInt(id)])
    if (delResult.affectedRows!==0){
        return res.send({flag:true,msg:'删除用户成功！'})
    }else{
        return res.send({flag:false,msg:'删除用户失败！'})
    }
})

/*8----修改用户状态--*/
router.put('/userStatus/:id/status/:status',(req, res) => {
    //console.log(req.params)  //{ id: '2', status: '1' }
    let id=req.params.id,status=req.params.status
    let sql="update user set status=? where id=?"
    db.query(sql,[status,id],(err,data)=>{
        if (err){
            throw err
        }else{
            if(data.length!==0){
                res.send({flag:true,msg:'修改用户状态成功！'})
            }else{
                res.send({flag:false,msg:'修改用户状态失败！'})
            }
        }
    })
})

router.get('/avatar',(req, res) => {
    let sql="select photo from user where username=?"
    db.query(sql,[req.auth.username],(err,data)=>{
        if (err){
            res.send({flag:false,msg:'头像加载失败'})
            return
        }else{
            // console.log(data[0].photo)
            res.send({flag:true,msg:'头像加载成功',avatar:data[0].photo,url:'http://127.0.0.1:3000/'+data[0].photo})
        }
    })
})
module.exports = router;
