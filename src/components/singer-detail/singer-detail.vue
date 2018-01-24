<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import MusicList from 'components/music-list/music-list'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      // 从store中获取数据
      ...mapGetters([
        'singer'
      ])
    },
    components: {
      'music-list': MusicList
    },
    created() {
      this._getDetail()
    },
    methods: {
      _getDetail() {
        // 边界情况处理
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normallizeSongs(res.data.list)
          }
        }).catch((e) => {
          console.log(e)
        })
      },
      _normallizeSongs(list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>

  .slide-enter-active,.slide-leave-active
    transition all .3s linear
  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
</style>
