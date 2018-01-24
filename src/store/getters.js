/* 获取state状态的映射 */
// es6语法，相当于function（state）{ return state.singer}
// vue文件通过getter获取数据singer

export const singer = state => state.singer
export const playing = state => state.playing
export const fullScreen = state => state.fullScreen
export const playList = state => state.playList
export const sequenceList = state => state.sequenceList
export const mode = state => state.mode
export const currentIndex = state => state.currentIndex
export const currentSong = (state) => {
  return state.playList[state.currentIndex] || {}
}

export const disc = state => state.disc

export const topList = state => state.topList

export const searchHistory = state => state.searchHistory

export const favoriteList = state => state.favoriteList

export const playHistory = state => state.playHistory
