// 缓存设置，locallStorage缓存，如果直接调用localStorage接口的话只能存入字符串，必须把数组转换成字符串，所以这里我们不直接使用缓存的接口,而是使用第三方插件

import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LENGTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 15

// 插入数据
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}
// 删除数据
function deleteOneArry(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 插入搜索历史数据
export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches)
  return searches
}
// 删除搜索历史数据，重新存入localStorage并返回修改后的新数组，并同步更改搜索历史的数据
export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteOneArry(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}
// 从缓存中读取
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}
// 清空缓存, 用于清空搜索历史
export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

// 加入收藏
export function saveFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}
// 从收藏中删除
export function deleteFavorite(song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteOneArry(songs, (item) => {
    return song.id === item.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}
// 读取收藏列表
export function loadFavorite() {
  return storage.get(FAVORITE_KEY, [])
}

// 插入播放历史数据
export function addPlayHistory(song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, songs)
  return songs
}
// 删除播放历史书籍
// 项目设计中没有删除，可以后加
export function deletePlayHistory(song) {
  let songs = storage.get(PLAY_KEY, [])
  deleteOneArry(songs, (item) => {
    return song.id === item.id
  })
  storage.set(PLAY_KEY, songs)
  return songs
}
// 读取播放列表
export function loadPlayHistory() {
  return storage.get(PLAY_KEY, [])
}
