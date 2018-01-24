<template>
  <div class="progress-circle">
    <!-- viewBox表示svg的视口大小，因为circle的半径r=50，视口的宽高为100=直径，所以svg图标会充满svg的视口 -->
    <!-- width、heigth表示实际图标的宽高，宽高数值越大图标也就越大，所以可以用 :width=“宽度变量” 代替 “width=32” 这里我们要通过父组件传递过来-->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- 外层圆 r表示半径，cx、cy表示圆心坐标-->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!-- 内层圆 stroke-dasharray表示描边的长度，最长是圆周=圆周率π*2*r， stroke-dashoffset表示描边的偏移，即 【0<= 偏移量 <= 圆周长】====>>【0 <= 偏移量 <= 314=π*2*r】 所以可以用它来标识歌曲播放的进度-->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffSet"/>
    </svg>
    <!-- 插入的“播放/暂停”控制按钮 -->
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      radius: {
        type: Number,
        default: 100
      },
      percent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100
      }
    },
    computed: {
      dashOffSet() {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px //stroke描边宽度
      transform-origin: center // 旋转中心点
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d // 描边颜色
      &.progress-bar
        transform: scale(0.9) rotate(-90deg) // -90deg是为了确定旋转起点的位置是左上角
        stroke: $color-theme
</style>
