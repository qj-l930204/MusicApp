/** 入口文件  */
import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
// 日志插件，用于查看数据的变化
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// 引入调试工具, 但是由于太耗费性能，只适合在开发时开启，不适合线上开启
const debug = process.env.NODE_ENV !== 'production'

// export一个store单例
export default new Vuex.Store({
  // 传入的参数
  actions,
  getters,
  state,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
// 使用时是在main.js里引入，并在router一样注入，就可在组件中使用
