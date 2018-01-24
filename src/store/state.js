/* 状态管理文件 */
import {playMode} from 'common/js/config'
import {loadSearch, loadFavorite, loadPlayHistory} from 'common/js/cache'

const state = {
  singer: {}, // 歌手
  playing: false, // 播放状态：播放/暂停
  fullScreen: false, // 播放器状态：展开/收起
  playList: [], // 实际播放列表(与播放模式有关：当顺序播放时与sequenceList一致)
  sequenceList: [], // 播放歌单列表(按序排列)
  mode: playMode.sequence, // 播放模式
  currentIndex: -1, // 当前播放歌曲索引
  disc: {}, // 类型歌单
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlayHistory(),
  favoriteList: loadFavorite()
}

export default state
