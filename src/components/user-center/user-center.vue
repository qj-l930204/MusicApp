<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <Switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></Switches>
      </div>
      <div class="play-btn" ref="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <Scroll class="list-scroll" v-if="currentIndex===0" :data="playHistory" ref="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </Scroll>
        <Scroll class="list-scroll" v-if="currentIndex===1" :data="favoriteList" ref="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </Scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="resultText"></no-result>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import NoResult from 'base/no-result/no-result'
  import {switchMixin, playlistMixin} from 'common/js/mixin'
  import {mapGetters, mapActions} from 'vuex'
  export default {
    mixins: [switchMixin, playlistMixin],
    data() {
      return {
        switches: [
          {name: '最近播放'},
          {name: '我的收藏'}
        ],
        resultText: '无最近播放歌曲'
      }
    },
    computed: {
      noResult() {
        if (this.currentIndex === 0) {
          this.resultText = '无最近播放歌曲'
          return !this.playHistory.length
        } else {
          this.resultText = '您还没有收藏的歌曲，快去收藏吧'
          return !this.favoriteList.length
        }
      },
      ...mapGetters([
        'playHistory',
        'favoriteList'
      ])
    },
    components: {
      Scroll,
      'song-list': SongList,
      'no-result': NoResult
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : 0
        this.$refs.listWrapper.style.bottom = bottom
        // 收藏和播放列表可能会不存在
        this.$refs.favoriteList && this.$refs.favoriteList.refresh()
        this.$refs.playList && this.$refs.playList.refresh()
      },
      selectSong(song) {
        this.insertSong(new Song(song))
      },
      back() {
        this.$router.back()
      },
      random() {
        // 注意这里list变量换成其他名时出错========================================================
        let list = this.currentIndex === 0 ? this.playHistory : this.favoriteList
        if (!list.length) {
          return
        }
        // 这里获取的list也是对象，不是song实例，只有song实例才会有lyric获取歌词等方法
        list = list.map((song) => {
          return new Song(song)
        })
        console.log(list)
        this.randomPlay({list})
      },
      ...mapActions([
        'insertSong',
        'randomPlay'
      ])
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
