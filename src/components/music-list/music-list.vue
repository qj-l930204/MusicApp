<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <!-- 用v-html是因为title中有转义字符 -->
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <!-- 随机播放按钮 -->
      <div class="play-wrapper" ref="playBtn">
        <div class="play" v-show="songs.length>0" @click="randomPlaySong">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <!-- 这个层用于实现歌单上下拖拉时顶部图片的动画特效 -->
    <div class="bg-layer" ref="layer"></div>
    <Scroll @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" :data="songs" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
      </div>
      <div class="loading-wrapper" v-show="!songs.length">
        <Loading></Loading>
      </div>
    </Scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import Loading from 'base/loading/loading'
  // 当在css中写样式时我们可以不考虑浏览器的兼容性(因为vue-loader安装有profiex插件，可以自动决解兼容性问题)，但是在js里我们必须要考虑到，因此，特意封装一个方法来决解：如webkitTransform
  import {prefixStyle} from 'common/js/dom'
  import {playlistMixin} from 'common/js/mixin'
  import {mapActions} from 'vuex'

  const RESERVE_HEIGHT = 40
  // 定义使用的样式常量，在需要使用时加上就可以了
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')

  export default {
    mixins: [playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    components: {
      'song-list': SongList,
      Scroll,
      Loading
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    methods: {
      handlePlaylist(playList) {
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
      // 此处item当需求是播放当前一首歌的时候就有用了，但这里我们获取的是播放的歌曲列表，所以传递的是songs，所以自组建相符组件传递参数不要根据是否有用来判断，能传递出来的都传递出来(复杂的数据)
      selectItem(item, index) {
        // 点击时需要提交播放器所需要的数据，这里我们就要用到vuex的actions了
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      randomPlaySong() {
        this.randomPlay({
          list: this.songs
        })
      },
      // 实时获取scroll的Y值并赋给实例的scrollY,在watch中监听scrollY的变化，通过数据scrollY来操作layer层的偏移量，从而实现图片的动画效果
      scroll(pos) {
        this.scrollY = pos.y
      },
      back() {
        this.$router.back()
      },
      // 调用actions中的方法
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ])
    },
    watch: {
      scrollY(newY) {
        let translateY = Math.max(this.minTranslateY, newY)
        let zIndex = 0 // 根据拖拉改变元素的层级
        let scale = 1  // 下拉实现图片的防缩
        let blur = 0   // 上推实现图片的模糊
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        const percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) {
          scale = 1 + percent
          zIndex = 10
        } else {
          blur = Math.min(20 * percent, 20)
//          scale = 1 - percent
        }
        // 上推高斯模糊，只在苹果手机有效果，一般安卓手机无效
        // 在style[常量名]使用，不用再写webkitTackdrop-filter
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`
        // this.$refs.filter.style['webkitTackdrop-filter'] = `blur(${blur}px)`
        // 上推预留高度
        if (newY < this.minTranslateY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVE_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
        // 下拉放大图片
        this.$refs.bgImage.style[transform] = `scale(${scale})`
      }
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted() {
      // 动态获取图片高度，并赋给播放歌曲列表插件的top属性
      this.imageHeight = this.$refs.bgImage.clientHeight
      this.minTranslateY = -this.imageHeight + RESERVE_HEIGHT
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
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
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position relative
      // 图片宽高比固定为10:7，先占位，便于根据不同的屏幕的宽高获取动态不同的图片高度值
      width 100%
      height 0
      padding-top 70%
      transform-origin top
      background-size cover
      .play-wrapper
        position absolute
        bottom 20px
        z-index 50
        width 100%
        .play
          box-sizing border-box
          width 135px
          padding 7px 0
          margin 0 auto
          text-align center
          border 1px solid $color-theme
          color $color-theme
          border-radius 100px
          font-size 0
          .icon-play
            display inline-block
            vertical-align middle
            margin-right 6px
            font-size $font-size-small
          .text
            display inline-block
            vertical-align middle
            font-size $font-size-small
      // bgImage内部蒙层，使在图片加载之前就可以固定高度，从而使得dom元素的高度被动态获取
      .filter
        position absolute
        top 0
        left 0
        width 100%
        height 100%
        background rgba(7,17,27,.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
