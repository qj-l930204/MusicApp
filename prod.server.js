// 手动编写的简易服务器
const express = require('express')
const config = require('./config/index')

const app = express()

// 静态资源入口设置
app.use(express.static('./dist'))

// 获取监听的端口号
var port = process.env.PORT || config.build.port
// 发起监听，启动服务器
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  // 向控制台输入信息
  console.log('Listening at http://localhost:' + port + '\n')
})
