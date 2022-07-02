const mysql = require('mysql')
let pool = mysql.createPool({
    connectionLimit: 10, ////连接池最多可以创建的连接数
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'express-app',
    queueLimit: 8 // 队伍中等待连接的最大数量，0为不限制。
})
let i = 0
pool.on('connection', () => {
    console.log(`创建第${i++}链接`)
})

module.exports = {
    query: function (sql, params, cb) {
        pool.getConnection((err, connection) => {
            if (err) {
                throw err
            } else {
                connection.query(sql, params, cb)
                //console.log(cb.toString())
                connection.release()// 释放连接
            }
        })
    },
    queryAsync: function (sql, params) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                     reject(err)
                } else {
                    connection.query(sql, params, (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                        connection.release();
                    })
                }
            })
        }).catch(err => {
            console.log(err + 'queryAsync出错')
        })
    }
}

