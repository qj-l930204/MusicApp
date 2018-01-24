<template>
  <transition name="slide">
    <music-list :bgImage="bgImage" :songs="songList" :title="title"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getDisclist} from 'api/disc'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default {
    data() {
      return {
        songList: []
      }
    },
    computed: {
      bgImage() {
        return this.disc.imgurl
      },
      title() {
        return this.disc.dissname
      },
      ...mapGetters([
        'disc'
      ])
    },
    components: {
      'music-list': MusicList
    },
    methods: {
      _getDiscList() {
        if (!this.disc.dissid) {
          this.$router.push('/recommend')
          return
        }
        // 只有当函数返回的是一个promise类型的时候才能调用then的形式获取回调数据
        getDisclist(this.disc.dissid).then((res) => {
          if (res.code === ERR_OK) {
            this.songList = this._normaLizeSonglist(res.cdlist[0].songlist)
          }
        })
      },
      _normaLizeSonglist(list) {
        let ret = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albumid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    },
    created() {
      this._getDiscList()
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
