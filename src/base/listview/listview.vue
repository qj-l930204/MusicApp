<template>
  <!-- probeType传3表示不节流， 否则快速滚动歌单时会出错，对应不到右边正确的字母-->
  <Scroll class="listview" :data="data" ref="listview" :listen-scroll="listenScroll" :probe-type="probeType" @scroll="getScrollY">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img v-lazy="item.avatar" width="50" height="50" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 右边字母栏-->
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.pervent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortCutlist" class="item" :data-index="index" :class="{'current': currentIndex === index}">{{item}}</li>
      </ul>
    </div>
    <!-- 顶部固定-->
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h2 class="fixed-title">{{fixedTitle}}</h2>
    </div>
    <!-- 载入提示，优化体验-->
    <div v-show="!data.length" class="loading-container">
      <Loading></Loading>
    </div>
  </Scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {getData} from 'common/js/dom'

  const ANCHOR＿HEIGHT = 18
  const TITLE_HEIGHT = 30

  export default {
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,
        diff: -1
      }
    },
    components: {
      Scroll,
      Loading
    },
    computed: {
      shortCutlist() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      // 固定顶部标题栏
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20) // 数据获取到渲染需要17ms
      },
      scrollY(newY) {
        const listHeight = this.listHeigth
        // 当滚动到顶部的时候，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
          // 当newY在歌单中间滚动，pos.y是负数，不滚动时坐标y为0，length-1是不让newY与最后一个下限做比较
        for (let i = 0; i < listHeight.length - 1; i++) {
          // 获取没项数组的上下限，并与newY做对比
          let heightT = listHeight[i]
          let heightB = listHeight[i + 1]
          if (-newY >= heightT && -newY < heightB) {
            this.currentIndex = i
            this.diff = heightB + newY
            return
          }
        }
        // 在实际的判断中，我们给数组的每一个元素都加了一个上限和下限，实际上，上一个元素的下限就是下一个元素的上限，所以，整个数组的上下限的总数量比数组的元素数量多了两个
        // 当滚动到底部，且-newY大于最后一个元素的上限（即数组最后一个元素的下限）
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
      }
    },
    created() {
      // 定义一个对象，赋予touch对象y的属性，以便在不同的函数方法中调用同一个属性
      // 这里不将对象定义在data中，是因为data、porops、computed里边的变量vue都会添加get、set，监听数据的变化，而这个变量不需要这些操作，也不需要被监听
      this.touch = {}
      this.listenScroll = true
      this.listHeigth = []
      this.probeType = 3
    },
    methods: {
      // 点击跳转歌手详情页，在此处向父组件singer传递id值
      selectItem(item) {
        this.$emit('select', item)
      },
      // 左右联动，点击右边动左边，(1)获取点击字母相对应的歌手的index值，通过:data-index属性获取
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0] // 获取手指触碰开始的地方
        this.touch.y1 = firstTouch.pageY // 获取开始触碰y值
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      // 左右联动，滑动右边动左边，(1)获取点击开始和移动结束时的手指touch的高度差，然后差除以每个字母li高度获得滑动的li的个数，在touchstart的基础上相加就可以了
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0] // 获取手指移动结束的地方
        this.touch.y2 = firstTouch.pageY // 获取结束移动y值
        // 后边或0“|0”表达向下取整，与Math.floor作用一致
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR＿HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta  // 不做类型转化的话原类型是字符串
        this._scrollTo(anchorIndex)
      },
      // 向父组件暴露的refresh方法，父组件调用
      refresh() {
        this.$refs.listview.refresh()
      },
      // 右左联动，滚动左边动右边
      getScrollY(pos) {
        this.scrollY = pos.y
      },
      _scrollTo(index) {
        // 这里的if判断是为了解决点击字母上下及周围空白处所触发的影响，或者也可以将touch函数绑定直接到li上
        if (!index && index !== 0) {
          return
        }
        if (index < 0) {
          index = 0
        } else if (index > this.listHeigth.length - 2) {
          index = this.listHeigth.length - 2
        }
        // 同理better-scroll已经对滚动事件做了边界空白的处理
        this.scrollY = -this.listHeigth[index]
        // 0的含义是滚动执行的时间段
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      },
      // 计算每个歌手分类列表的高度，然后判断当前高度y在那个范围内，从而确定右边当前current字母
      _calculateHeight() {
        this.listHeigth = []
        let height = 0
        // 将每个列表的高度push到一个数组中,然后遍历数组，看pos过来的y落在哪个数组中
        this.listHeigth.push(height)
        const list = this.$refs.listGroup
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += item.clientHeight
          this.listHeigth.push(height)
        }
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import "../../common/stylus/variable.styl"
  .listview
    position relative
    width 100%
    height 100%
    overflow hidden
    background $color-background
    .list-group
      padding-bottom 30px
      .list-group-title
        height 30px
        line-height 30px
        padding-left 20px
        font-size $font-size-small
        color $color-text-l
        background $color-highlight-background
      .list-group-item
        display flex
        align-items center
        padding 20px 0 0 30px
        .avatar
          width 50px
          height 50px
          border-radius 50%
        .name
          margin-left 20px
          color $color-text-l
          font-size $font-size-medium
    .list-shortcut
      position absolute
      z-index 30
      right 0
      top 50%
      transform translateY(-50%)
      width 20px
      padding 20px 0
      border-radius 10px
      text-align center
      background $color-background-d
      font-family Helvetica
      .item
        padding 3px
        line-height 1
        color $color-text-l
        font-size $font-size-small
        &.current
          color $color-theme
    .list-fixed
      position absolute
      top 0
      left 0
      width 100%
      .fixed-title
        height 30px
        line-height 30px
        padding-left 20px
        font-size $font-size-small
        color $color-text-l
        background $color-highlight-background
    .loading-container
      position absolute
      width 100%
      top 50%
      transform translateY(-50%)
</style>
