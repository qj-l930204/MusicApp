<template>
  <div class="search">
    <div class="search-box-wrapper">
      <sreach-box ref="searchBox" @query="onQueryChange"></sreach-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <Scroll class="shortcut" :data="shortcut" :refreshDelay="refreshDelay" ref="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li v-for="song in hotSongs" class="item" @click="addQuery(song.k)">
                <span>{{song.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
            <span class="text">搜索历史</span>
            <!-- 直接调用map来的方法给click事件 -->
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
          <!-- 直接调用map来的方法给监听事件delete -->
          <search-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></search-list>
        </div>
        </div>
      </Scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <Suggest :query="query" @listScroll="blurInput" @select="saveToHistory" ref="suggest"></Suggest>
    </div>
    <Confirm text="是否清空搜索历史" ref="confirm" @confirm="confirm"></Confirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import Suggest from 'components/suggest/suggest'
  import SearchList from 'base/search-list/search-list'
  import Confirm from 'base/confirm/confirm'
  import Scroll from 'base/scroll/scroll'
  import {getHotSong} from 'api/search'
  import {ERR_OK} from 'api/config'
  import {mapActions, mapGetters} from 'vuex'
  import {playlistMixin, searchMixin} from 'common/js/mixin'

  export default {
    mixins: [playlistMixin, searchMixin],
    data() {
      return {
        hotSongs: []
      }
    },
    computed: {
      shortcut() {
        return this.hotSongs.concat(this.searchHistory)
      },
      ...mapGetters([
        'searchHistory'
      ])
    },
    components: {
      'search-list': SearchList,
      Suggest,
      Confirm,
      Scroll
    },
    watch: {
      query(newQuery) {
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
    methods: {
      // 这里的clearHistory，deleteOneHistory都是actions里方法'deleteSearchHistory'和'clearSearchHistory'的代理，所以可以直接将mapActions来的方法赋值给
      // 子组件的监听函数，并且参数相对应
      // deleteOneHistory(item) {
      //  this.deleteSearchHistory(item)
      // },
      showConfirm() {
        this.$refs.confirm.show()
      },
      confirm() {
        this.clearSearchHistory()
      },
      handlePlaylist(playlist) {
        const bottom = playlist.length ? '60px' : ''
        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()
        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()
      },
      _getHot() {
        getHotSong().then((res) => {
          if (res.code === ERR_OK) {
            this.hotSongs = res.data.hotkey.slice(0, 10)
          }
        })
      },
      ...mapActions([
        'clearSearchHistory'
      ])
    },
    created() {
      this._getHot()
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
