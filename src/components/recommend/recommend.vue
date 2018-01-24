<template>
  <div class="recommend" ref="recommend">
    <!-- 这个项目获取数据都是通过Peomise异步获取的，故即使将better-scroll初始化写在mouted钩子中，也不能确保初始化在dom渲染之后，所以要通过data传递数据来限制-->
    <!-- 这里我们传入discLists数据之后子再初始化，确保在dom渲染完成后better-scroll再计算到正确的dom高度/宽度-->
    <!-- 这里只传discLists，是因为程序中recommends是在discLists之前就获取到的，因此，只要discLists获取到了，那么recommends就已经渲染完成了-->
    <Scroll class="recommend-content" :data="discLists" ref="scroll">
      <!-- 传入scroll的插槽slot中的dom-->
      <div>
        <!-- 因为抓取数据是异步进行的，故在slider中插入dom内容钱要确保数据已经获取到，否则没有想过-->
        <div v-if="recommends.length" class="slider-wrapper">
          <Slider>
            <!-- 在这里插入slider插槽内容-->
            <div v-for="item in recommends">
              <a :href="item.linkUrl">
                <!-- 懒加载后a标签单击事件被fastclick拦截，我们要设置一个类，class=“needsclick”来阻止fastclick对点击事件的拦截, （双击不会被拦截）-->
                <img class="needsclick" @load="loadImage" :src="item.picUrl">
              </a>
            </div>
          </Slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="item in discLists" class="item" @click="selectItem(item)">
              <div class="icon">
                <!-- 使用图片懒加载，减少首页加载服务请求数量，优化-->
                <img v-lazy="item.imgurl" width="60" height="60">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 当网速慢或者数据未加载时显示的提示，更友体验-->
      <div v-show="!this.discLists.length" class="loading-container">
        <Loading></Loading>
      </div>
    </Scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  import {playlistMixin} from 'common/js/mixin'
  import {getRecommend, getDiscList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    data() {
      return {
        recommends: [],
        discLists: []
      }
    },
    components: {
      Slider,
      Scroll,
      Loading
    },
    created() {
      // 在这个项目中我们知道getDiscList在getRecommend之后获取到，但实际项目中不确定哪个属能先获取到，如果getRecommend后获取到，那么结果歌单就滚动不到底部
      // （少了recommend容器的高度），所以我们在传递data之外还需要确定better-scroll的初始化在轮播图渲染之后，研究发现，轮播图recommend的渲染高度不固定，完全是根据图片的大小来设定的，也就是说只要确定初始化在图片渲染之后
      // 所以在图片load的时候绑定一个方法，在方法中refresh即可
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      handlePlaylist(playList) {
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      selectItem(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDisc(item)
      },
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === 0) {
            this.discLists = res.data.list
          }
        })
      },
      // 但是会有多个图片的load，而refresh只要一次就可以，所以我们设置一个标识，使refresh只在第一张图片选然后就执行一次
      // 这样就可以正确初始化scroll了，不用管数据获取和渲染的先后
      loadImage() {
        if (!this.loadFrist) {
          this.$refs.scroll.refresh()
          this.loadFrist = true
        }
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import "../../common/stylus/variable"
  .recommend
    position fixed
    width 100%
    top 88px
    bottom 0
    .recommend-content
      height 100%
      overflow hidden
      .slider-wrapper
        position relative
        width 100%
        overflow hidden
      .recommend-list
        .list-title
          height 65px
          line-height 65px
          text-align center
          font-size $font-size-medium
          color $color-theme
        .item
          display flex
          box-sizing border-box
          // flex水平居中
          align-items center
          padding 0 20px 20px 20px
          .icon
            flex 0 0 60px
            width 60px
            padding-right 20px
          .text
            // 经典移动端布局【1】----------------------------------》》》
            // 嵌套flex元素，既是flex item， 又是flex
            // 垂直方向居中
            display flex
            flex-direction column
            justify-content center
            flex 1
            line-height 20px
            overflow hidden
            font-size $font-size-medium
            .name
              margin-bottom 10px
              color $color-text
            .desc
              color $color-text-d
      .loading-container
        position absolute
        width 100%
        top 50%
        transform translateY(-50%)
</style>
