import 'babel-polyfill' // 补丁必须最先引入
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store' // 此处必须小写开头
import Fastclick from 'fastclick'
import Lazyload from 'vue-lazyload'

import 'common/stylus/index.styl'

// 手机调试插件，上线时注销,在其他配置文件里用 var vConsole = require('vconsole')引入
/* eslint-disable no-unused-vars */
// import VConsole from 'vconsole'
// // 手机调试测试
// var vaConsole = new VConsole()
// console.log('aaa')

Vue.config.productionTip = false

Fastclick.attach(document.body)

Vue.use(Lazyload, {
  // 默认未加载时显示的图片， 可设置的参数去官网查看
  loading: require('./common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
