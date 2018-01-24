<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
      <!-- 背景图 -->
      <div class="background">
        <img :src="currentSong.image" width="100%" height="100%">
      </div>
      <!-- 顶部：返回键、歌曲名、歌手名 -->
      <div class="top">
        <div class="back" @click="back">
          <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="currentSong.name"></h1>
        <h2 class="subtitle" v-html="currentSong.singer"></h2>
      </div>
      <!-- 中间唱片 -->
      <div class="middle"
           @touchstart.prevent="touchStart"
           @touchmove.pervent="touchMove"
           @touchend="touchEnd"
      >
        <div class="middle-l" ref="middleCd">
          <div class="cd-wrapper" ref="cdWrapper">
            <!-- 逻辑简单的:class也可以用计算属性的方式添加，像playingIcon一样 -->
            <div class="cd" :class="cdClass">
              <img :src="currentSong.image" class="image">
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
        </div>
        <Scroll class="middle-r" :data="currentLyric && currentLyric.lines" ref="lyricList" >
          <div class="lyric-wrapper">
            <div v-if="currentLyric">
              <p ref="lyricLine" class="text" v-for="(line, index) in currentLyric.lines" :class="{'current': currentLine === index}">{{line.txt}}</p>
            </div>
          </div>
        </Scroll>
      </div>
      <!-- 底部操作区 -->
      <div class="bottom">
        <div class="dot-wrapper">
          <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
          <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
        </div>
        <!-- 播放歌曲的进显示 -->
        <div class="progress-wrapper">
          <span class="time time-l">{{formate(currentTime)}}</span>
          <div class="progress-bar-wrapper">
            <progress-bar :percent="percent" @percentChange="onPercentChange"></progress-bar>
          </div>
          <span class="time time-r">{{formate(currentSong.duration)}}</span>
        </div>
        <!-- 操作按钮 -->
        <div class="operators">
          <div class="icon i-left">
            <i @click="changePlayMode" :class="iconMode"></i>
          </div>
          <!-- 样式上显示不能点击的样式 -->
          <div class="icon i-left" :class="disableClass">
            <i @click="prev" class="icon-prev"></i>
          </div>
          <div class="icon i-center" :class="disableClass">
            <i @click="togglePlay" :class="playingIcon"></i>
          </div>
          <div class="icon i-right" :class="disableClass">
            <i @click="next" class="icon-next"></i>
          </div>
          <div class="icon i-right">
            <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
          </div>
        </div>
      </div>
    </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :src="currentSong.image" :class="cdClass" width="40" height="40">
        </div>
        <div class="text">
          <div class="name" v-html="currentSong.name"></div>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <!-- 当子组件中需要传入的是Number类型的变量时，不能直接radius=“32”，因为编辑器会将它转化成string类型，所以，需要定义一个data变量并赋予Number类型的值才行 -->
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlay" :class="miniplayingIcon" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <play-list ref="playList"></play-list>
    <!-- 播放器 -->
    <!-- audio自带的两个方法，防止快速切换歌曲时出现错误 并在歌曲播放时默认派发事件timeupdate,用来获取歌曲播放时的一些状态、进度等信息,在歌曲播放完后派发事件ended-->
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="endSong"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import createAnimations from 'create-keyframe-animation'
  import progressBar from 'base/progress-bar/progress-bar'
  import progressCircle from 'base/progress-circle/progress-circle'
  import Scroll from 'base/scroll/scroll'
  import Lyric from 'lyric-parser'
  import PlayList from 'components/play-list/play-list'
  import {prefixStyle} from 'common/js/dom'
  import {playMode} from 'common/js/config'
  import {playMixin} from 'common/js/mixin'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

  export default {
    mixins: [playMixin],
    data() {
      return {
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentLyric: null,
        currentLine: 0,
        currentShow: 'cd',
        playingLyric: ''
      }
    },
    computed: {
      playingIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniplayingIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdClass() {
        // 这里同时写play和pause两个样式，是为了实现暂停后图片保持在旋转后的状态，否则已暂停，图片就会回到原来载入是的状态
        return this.playing ? 'play' : 'play pause'
      },
      disableClass() {
        return this.songReady ? '' : 'disable'
      },
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen',
        'playing',
        'currentIndex'
      ])
    },
    components: {
      'progress-bar': progressBar,
      'progress-circle': progressCircle,
      'play-list': PlayList,
      Scroll
    },
    watch: {
      currentSong(newSong, oldSong) {
        // 这里用！newSong不行，进不去if
        if (!newSong.id) {
          return
        }
        if (newSong.id === oldSong.id) {
          return
        }
        if (this.currentLyric) {
          this.currentLyric.stop()
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLine = 0
        }
        // 播放动作和播放源的动左不能同时进行，故播放动作需要延后，等播放源获取到后再进行,异步和setTimeout()都可以, 但是如果要兼容微信，就要用setTimeOut
        // 当快速切换歌曲时，有因为一下操作延迟1秒，而使得原本应该在setTimeout中getLyric操作之后进行的操作(audio.pause()、audio.play())率先得到了执行，所以会出现歌曲实际已经暂停，但歌词仍然继续播放的错误
        // 所以，需要清除setTimeout，使setTimeout只执行最后一次的操作
        // 同时，audio的canplay事件也需要更改，改成开始播放时触发改变onReady标志，即所有准备工作就绪后，更改onReady标志为true，继而进行播放，所以需要将canplay改为play
        // 具体执行时机参考w3c的audio
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.$refs.audio.play()
          this._getLyric()
        }, 1000)
      },
      playing(newPlaying) {
        this.$nextTick(() => {
          newPlaying ? this.$refs.audio.play() : this.$refs.audio.pause()
        })
      },
      fullScreen(newVal) {
        if (newVal) {
          setTimeout(() => {
            this.$refs.lyricList.refresh()
          }, 20)
        }
      }
    },
    methods: {
      onPercentChange(percent) {
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        if (!this.playing) {
          this.togglePlay()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },
      // 这里不能直接在组件里更改属性值，必须通过mutations或者actions才可以，所以要使用mutation-types里定义的方法
      back() {
        // 收起播放器
        this.setFullScreen(false)
      },
      open() {
        // 展开播放器
        this.setFullScreen(true)
      },
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()
        // 【二】定义动画
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        // 【三】注册动画
        createAnimations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear',
            delay: 100
          }
        })
        createAnimations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        // 移除动画
        createAnimations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        // 离开时动画不需要用createAnimations，我们只要用原生js编写即可,使大图片移动到左下角
        this.$refs.cdWrapper.style.transition = 'all .4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      // 前后切换歌曲
      prev() {
        // if判断功能上数据未获取时不能点击
        if (!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
          return
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playList.length - 1
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlay()
          }
        }
        this.songReady = false
      },
      next() {
        if (!this.songReady) {
          return
        }
        if (this.playList.length === 1) {
          this.loop()
          return
        } else {
          let index = this.currentIndex + 1
          if (index === this.playList.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          if (!this.playing) {
            this.togglePlay()
          }
        }
        this.songReady = false
      },
      showPlaylist() {
        this.$refs.playList.show()
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime // 获取到的播放时间是一个时间戳
      },
      // 对时间戳格式化，并且位数不足时数前补0
      formate(interval) {
        interval = interval | 0 // 向下取整
        let minute = this._pad(interval / 60 | 0) // 获取分钟数
        let second = this._pad(interval % 60) // 获取秒数
        return `${minute}:${second}` // 拼接时间分：秒
      },
      // 播放完当前歌曲自动播放下一首
      endSong() {
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        // 直接设置时间循环时就不会在发送请求，如果通过传入歌曲id的方式会发送各种请求，同时也需要重置css样式
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      touchStart(e) {
        // 获取手指开始碰触时的状态和位置
        this.touch.initiated = true // 代表已经初始化
        this.touch.startX = e.touches[0].pageX // 获取手指开始位置
        this.touch.startY = e.touches[0].pageY // 获取手指开始位置
      },
      touchMove(e) {
        // 获取移动偏移量
        if (!this.touch.initiated) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX
        const deltaY = e.touches[0].pageY - this.touch.startY
        if (Math.abs(deltaX) < Math.abs(deltaY)) {
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        this.$refs.middleCd.style.opacity = 1 - this.touch.percent
        this.$refs.middleCd.style[transitionDuration] = 0
      },
      // 滑动结束后的状态
      touchEnd() {
        this.touch.initiated = false
        let offsetWidth
        let opacity
        // if从右向左滑动， else从左向右滑动
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.2) {  // 滑动距离超过10%, 则歌词滑动过来，否则歌词回到原位置，不会出现在屏幕中
            offsetWidth = -window.innerWidth
            this.currentShow = 'lyric'
            opacity = 0
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.8) {
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleCd.style.opacity = opacity
        this.$refs.middleCd.style[transitionDuration] = `${time}ms`
      },
      // 补0方法
      _pad(num, n = 2) {
        let length = num.toString().length
        while (length < n) {
          num = '0' + num
          length++
        }
        return num
      },
      // 【一】获取动画开始--结束位置的坐标偏移量和缩放比例
      _getPosAndScale() {
        const miniWidth = 40
        const miniLeft = 40
        const miniBottom = 30
        const largeWidth = window.innerWidth * 0.8
        const largeTop = 80
        const scale = miniWidth / largeWidth // 计算缩放比例
        // 计算偏移量x ，y
        const x = -(window.innerWidth / 2 - miniLeft)
        const y = window.innerHeight - largeTop - largeWidth / 2 - miniBottom
        return {
          x,
          y,
          scale
        }
      },
      _getLyric() {
        this.currentSong.getLyric().then((lyric) => {
          if (this.currentSong.lyric !== lyric) {
            return
          }
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLine = 0
        })
      },
      // 这里参数txt必须是txt，改成其他的不eg：text就获取不到
      handleLyric({lineNum, txt}) {
        this.currentLine = lineNum
        if (lineNum > 5) {
          let lyricEl = this.$refs.lyricLine[lineNum - 5] // SCROLL要滚动到的位置
          if (this.playing) {
            this.$refs.lyricList.scrollToElement(lyricEl, 1000) // 1秒钟lyric滚动一次，滚动的位置就是一次一行
          } else {
            this.$refs.lyricList.scrollTo(0, 0, 1000)
          }
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      // 播放/暂停歌曲
      togglePlay() {
        if (!this.songReady) {
          return
        }
        // 不能直接修改状态，必须通过store来操作
        // this.$refs.audio.pause()
        this.setPlaying(!this.playing)
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      ready() {
        this.songReady = true
        this.setPlayHistory(this.currentSong)
      },
      error() {
        this.songReady = true
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'setPlayHistory'
      ])
    },
    created() {
      this.touch = {}
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
            margin 0 5px
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
