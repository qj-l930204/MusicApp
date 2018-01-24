// 组件中同名方法可以覆盖mixin中的方法
import SearchBox from 'base/search-box/search-box'
import Switches from 'base/switches/switches'
import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  watch: {
    playList(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
      // 在组件中使用时，要定义同名的方法，会覆盖mixin的方法，否则就会调用mixin本身定义的方法
      throw new Error('component must implement handlePlaylist method')
    }
  },
  mouted() {
    this.handlePlaylist(this.playList)
  },
  activated() {
    this.handlePlaylist(this.playList)
  }
}

export const playMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playList',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    changePlayMode() {
      const mode = (this.mode + 1) % 3 // 一共有三种模式，
      this.setPlayMode(mode)
      let list = null
      // 切换播放模式的逻辑实现
      if (mode === playMode.random) {
        // 随机播放
        list = shuffle(this.playList)
      } else {
        // 循环播放
        // 顺序播放
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    // 收藏相关
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      }
      return 'icon-not-favorite'
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFromFavorite(song)
      } else {
        this.saveToFavorite(song)
      }
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setPlayMode: 'SET_PLAY_MOOD',
      setPlayList: 'SET_PLAYLIST',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlaying: 'SET_PLAYING'
    }),
    ...mapActions([
      'saveToFavorite',
      'deleteFromFavorite'
    ])
  }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 120
    }
  },
  components: {
    'sreach-box': SearchBox
  },
  methods: {
    // 这里需要设置子组件search-box的搜索词，所以要调用子组件的方法
    addQuery(key) {
      this.$refs.searchBox.setQuery(key)
    },
    onQueryChange(query) {
      this.query = query
    },
    blurInput() {
      // 通过使input失去焦点的方式收起手机键盘，失去焦点的操作在input所在的子组件search-box中
      this.$refs.searchBox.blur()
    },
    saveToHistory() {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}

export const switchMixin = {
  data() {
    return {
      currentIndex: 0
    }
  },
  components: {
    Switches
  },
  methods: {
    switchItem(index) {
      this.currentIndex = index
    }
  }
}
