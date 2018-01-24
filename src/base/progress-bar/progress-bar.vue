<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <!-- stop作用是阻止冒泡，prevent作用阻止浏览器的默认行为 -->
      <div class="progress-btn-wrapper"
           @touchstart.prevent="touchStart"
           @touchend.prevent="touchEnd"
           @touchmove="touchMove"
           ref="progressBtn"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'

  const transform = prefixStyle('transform')
  const btnWidth = 16
  export default {
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    watch: {
      percent(newPercent) {
        if (newPercent >= 0 && !this.initiated) {
          const barWidth = this.$refs.progressBar.clientWidth - btnWidth
          const offsetWidth = newPercent * barWidth
          this._offset(offsetWidth)
        }
      }
    },
    methods: {
      touchStart(e) {
      // 获取手指开始碰触时的状态和位置
        this.touch.initiated = true // 代表已经初始化
        this.touch.startX = e.touches[0].pageX // 获取手指开始位置
        this.touch.left = this.$refs.progress.clientWidth // 获取当前歌曲播放进度
      },
      touchMove(e) {
        // 获取移动偏移量
        if (!this.touch.initiated) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - btnWidth, Math.max(0, this.touch.left + deltaX))
        this._offset(offsetWidth)
      },
      touchEnd() {
        this.touch.initiated = false
        this._trigglePercent()
      },
      progressClick(e) {
        // 这样操作，当点击到按钮上时获取不到正确的offsetX值
        // this._offset(e.offsetX)
        // 所以我们要用获取到相对屏幕的x值减去bar左边到屏幕的距离的方法获取正确的offsetX值
        const rect = this.$refs.progressBar.getBoundingClientRect()
        const offsetWidth = e.pageX - rect.left
        this._offset(offsetWidth)
        this._trigglePercent()
      },
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      },
      _trigglePercent() {
        const barWidth = this.$refs.progressBar.clientWidth - btnWidth
        const percent = this.$refs.progress.clientWidth / barWidth
        this.$emit('percentChange', percent)
      }
    },
    created() {
      // 将所有touch事件挂载到touch实例上，方便多个函数之间公用某个属性
      this.touch = {}
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
