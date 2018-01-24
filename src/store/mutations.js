/* 相关的数据同步操作，异步在actions中 */
// 首先引入其他文件提供的辅助的元素
// 这种es6的日纳入方法可以在使用时以 “对象.属性/方法” 的方式调用
// 通常每个mutation都会有mutation-type做关联，存储一些常量名等信息
import * as types from './mutation-types'

const mutations = {
  [types.SET_SINGER](state, singer) {
    state.singer = singer // mutation获取到数据
  },
  [types.SET_PLAYING](state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST](state, list) {
    state.playList = list
  },
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },
  [types.SET_PLAY_MOOD](state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },
  [types.SET_DISC](state, disc) {
    state.disc = disc
  },
  [types.SET_TOPLIST](state, list) {
    state.topList = list
  },
  [types.SET_SEARCH_HISTORY](state, history) {
    state.searchHistory = history
  },
  [types.SET_FAVORITE_LIST](state, list) {
    state.favoriteList = list
  },
  [types.SET_PLAY_HISTORY](state, history) {
    state.playHistory = history
  }
}
export default mutations
