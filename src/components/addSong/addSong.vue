<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">{{tipText}}</span>
        </div>
      </top-tip>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <sreach-box @query="onQueryChange" ref="searchBox"  placeholder="搜索歌曲"></sreach-box>
      </div>
      <div class="shortcut" v-show="!query" ref="shortcut">
        <Switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></Switches>
        <div class="list-wrapper">
          <Scroll class="list-scroll" v-if="currentIndex===0" :data="playHistory" :refreshDelay="refreshDelay" ref="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </Scroll>
          <Scroll class="list-scroll" v-if="currentIndex===1" :data="searchHistory" :refreshDelay="refreshDelay" ref="searchHistory">
            <div class="list-inner">
              <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
            </div>
          </Scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <Suggest :query="query" :showSinger="showSinger" @select="saveToHistory" @listScroll="blurInput"></Suggest>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
  import Suggest from 'components/suggest/suggest'
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Song from 'common/js/song'
  import SearchList from 'base/search-list/search-list'
  import TopTip from 'base/top-tip/top-tip'
  import {searchMixin, switchMixin} from 'common/js/mixin'
  import {mapGetters, mapActions} from 'vuex'
  export default {
    mixins: [searchMixin, switchMixin],
    data() {
      return {
        showFlag: false,
        showSinger: false,
        switches: [
          {name: '最近播放'},
          {name: '搜索历史'}
        ],
        tipText: '插入成功'
      }
    },
    computed: {
      ...mapGetters([
        'playHistory',
        'searchHistory'
      ])
    },
    components: {
      Suggest,
      Scroll,
      'song-list': SongList,
      'search-list': SearchList,
      'top-tip': TopTip
    },
    methods: {
      show() {
        this.showFlag = true
        setTimeout(() => {
          if (this.currentIndex === 0) {
            this.$refs.playHistory.refresh()
          } else {
            this.$refs.searchHistory.refresh()
          }
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      selectSong(song, index) {
        if (index !== 0) {
          // 这里参数song是从catces的storage里获取的对象类型的数据，虽然具有的属性相同，单并不是Song的歌曲实例，所以，需要引入Song类，做实例化
          // 组件使用注意组件需要的props和供外界使用方法
          // 方法的使用注意参数及参数类型,参数顺序
          this.insertSong(new Song(song))
        }
        // 插入成功，弹出提示
        this.$refs.topTip.show()
        // 用于关闭播放列表，但play-list组件还未监听，因为会产生其他反应
        this.$emit('close')
      },
      ...mapActions([
        'insertSong'
      ])
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>
