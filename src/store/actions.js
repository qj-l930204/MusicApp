/* 对mutation进行封装或对数据的异步操作，同步在mutation中 */
import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch, deleteSearch, clearSearch, saveFavorite, deleteFavorite, addPlayHistory} from 'common/js/cache'

// 查找一首歌是否在播放歌单中，并返回歌曲的索引值
function FindIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

// 提交音乐播放器相关的数据， 传递的参数是两个对象,commit提交，state读取
export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list) // 顺序播放列表
  if (state.mode === playMode.random) {
    let randomList = shuffle(list) // 随机播放的歌单顺序
    commit(types.SET_PLAYLIST, randomList)  // 播放列表
    index = FindIndex(randomList, list[index]) // 随机播放的新歌单的songid序列
  } else {
    commit(types.SET_PLAYLIST, list)  // 播放列表
  }
  commit(types.SET_CURRENT_INDEX, index) // 当前播放歌曲索引
  commit(types.SET_FULL_SCREEN, true) // 播放器是否展开
  commit(types.SET_PLAYING, true) // 播放状态，true为播放，false为暂停
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MOOD, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list) // 顺序播放列表
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)  // 播放列表
  commit(types.SET_CURRENT_INDEX, 0) // 从第一手歌开始随机
  commit(types.SET_FULL_SCREEN, true) // 播放器是否展开
  commit(types.SET_PLAYING, true) // 播放状态，true为播放，false为暂停
}

// 搜索页面点击播放涉及到多个state变量，操作：改变当前currentIndex、改变playlist、检查sequenselist，如果已有被选中的歌曲，需要删除
// 修改歌曲播放列表song
export const insertSong = function ({commit, state}, song) {
  // 获取state数据
  // 注意：就算在actions里也不能直接修改state的数据状态，否则会报错，如下的程序中我们要给获取到的playList插入一首歌曲，那么一旦插入后，原state中的playList也会被同步插入，
  // 所以，为了防止这种情况，在获取数据时需要加.slice()来创建一个列表的副本，这样就不会直接在mutations外面更改state的数据状态了
  // currentIndex为什么不用副本？ 因为currentIndex是值类型，它的获取是将state里的值赋值给新的变量currentIndex，是另一块数据空间，故改变这个currentIndex的值不会影响原state的数据
  // 而引用类型的获取是给原空间起了一个别名，两个变量指向的是同一块空间的同一个数据值，一个变，另一个一定也随之改变
  // 最后将修改好的副本通过commit提交到mutations的回调函数就可以了
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  // 将歌曲插入playlist列表
  // 记录当前歌曲
  let currentSong = playList[currentIndex]
  // 找当前歌曲是否在歌单里
  let fpIndex = FindIndex(playList, song)
  // 把歌曲插入fpIndex的下一个位置,插入歌曲
  currentIndex++
  // 插入这首歌到当前位置
  playList.splice(currentIndex, 0, song)
  if (fpIndex > -1) {
    // 如果列表中有这首歌，且当前插入位置序号大于列表中序号，当前位置靠前，则直接删除，删除之后列表长度减1
    if (currentIndex > fpIndex) {
      playList.splice(fpIndex, 1)
      currentIndex--
    } else {
      playList.splice(fpIndex + 1, 1)
    }
  }
  // 把歌曲插入sequencelist列表
  let currentSIndex = FindIndex(sequenceList, currentSong) + 1
  let fsIndex = FindIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    // 如果列表中有这首歌，且当前插入位置序号大于列表中序号，当前位置靠前，则直接删除，删除之后列表长度减1
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING, true)
}

export const deleteSong = function ({commit, state}, song) {
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex

  // 查找删除歌曲再列表中的位置,并删除
  let pIndex = FindIndex(playList, song)
  playList.splice(pIndex, 1)

  let sIndex = FindIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)

  if (currentIndex > pIndex || currentIndex === playList.length) {
    currentIndex--
  }
  commit(types.SET_PLAYLIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  // 如果播放列表中没有歌单
  const playingState = playList.length > 0
  commit(types.SET_PLAYING, playingState)
}

export const clearSong = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING, false)
}

// 修改搜索历史列表
export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 修改收藏列表
export const saveToFavorite = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFromFavorite = function ({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}

// 清空收藏尚无此操作
// export const clearFavorite = function ({commit}) {
//   commit(types.SET_FAVORITE_LIST, [])
// }

// 修改播放历史列表
export const setPlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, addPlayHistory(song))
}
// 项目设计中没有删除项和清空，可以后加
// export const deletPlayHistory = function ({commit}, song) {
//   commit(types.SET_PLAY_HISTORY, deletePlayHistory(song))
// }
// export const clearPlayHistory = function ({commit}) {
//   commit(types.SET_PLAY_HISTORY, [])
// }
