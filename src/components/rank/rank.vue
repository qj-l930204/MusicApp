<template>
  <div class="rank" ref="rank">
    <Scroll class="toplist" :data="topList" ref="toplist">
      <ul>
        <li class="item" v-for="list in this.topList" @click="selectList(list)">
          <div class="icon">
            <img v-lazy="list.picUrl" width="100" height="100">
          </div>
          <ul class="songlist">
            <li class="song" v-for="(songs, index) in list.songList">
              <span>{{index + 1}}</span>
              <span>{{songs.songname}}-{{songs.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <Loading></Loading>
      </div>
    </Scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'
  import {getRank} from 'api/rank'
  import {ERR_OK} from 'api/config'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        topList: []
      }
    },
    components: {
      Scroll,
      Loading
    },
    methods: {
      selectList(list) {
        this.$router.push(
          {
            path: `/rank/${list.id}`
          }
        )
        this.setToplist(list)
      },
      handlePlaylist(playlist) {
        const bottom = playlist.length ? '60px' : ''
        this.$refs.rank.style.bottom = bottom
        this.$refs.toplist.refresh()
      },
      _getrank() {
        getRank().then((res) => {
          if (res.code === ERR_OK) {
            this.topList = res.data.topList
          }
        })
      },
      ...mapMutations({
        setToplist: 'SET_TOPLIST'
      })
    },
    created() {
      this._getrank()
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .rank
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .toplist
      height: 100%
      overflow: hidden
      .item
        display: flex
        margin: 0 20px
        padding-top: 20px
        height: 100px
        &:last-child
          padding-bottom: 20px
        .icon
          flex: 0 0 100px
          width: 100px
          height: 100px
        .songlist
          flex: 1
          display: flex
          flex-direction: column
          justify-content: center
          padding: 0 20px
          height: 100px
          overflow: hidden
          background: $color-highlight-background
          color: $color-text-d
          font-size: $font-size-small
          .song
            no-wrap()
            line-height: 26px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
