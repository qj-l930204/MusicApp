<template>
  <div class="singer" ref="singer">
    <ListView :data="singerList" @select="selectSinger" ref="singerlist"></ListView>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
  import ListView from 'base/listview/listview'
  import {getSingerlist} from 'api/singer'
  import Singer from 'common/js/singer'
  import {ERR_OK} from 'api/config'
  // 【一】使用vuex提供的语法糖获取state中的数据，mapMutations对mutations做了一层封装====================
  import {mapMutations} from 'vuex'
  import {playlistMixin} from 'common/js/mixin'

  const HOT_NAME = '热门'
  const HOT_SIGER_LEN = 10
  export default {
    mixins: [playlistMixin],
    data() {
      return {
        singerList: []
      }
    },
    components: {
      ListView
    },
    created() {
      this._getSingerList()
    },
    methods: {
      handlePlaylist(playList) {
        const bottom = playList.length > 0 ? '60px' : ''
        this.$refs.singer.style.bottom = bottom
        // 刷新scroll，需要子组件listview向外暴露refresh方法
        this.$refs.singerlist.refresh()
      },
      // 参数是singer实例
      selectSinger(singer) {
        this.$router.push({
          path: `/singer/${singer.id}`
        })
        // 【三】调用映射将数据提交到state的数据,并作相应的操作，在singer-detail自组件中获取============================
        this.setSinger(singer)
      },
      _getSingerList() {
        getSingerlist().then((res) => {
          if (res.code === ERR_OK) {
            this.singerList = this._normalizeSinger(res.data.list)
          }
        })
      },
      // 获取到的数据不是我们想要的格式，我们要进行分类处理
      // 我们需要的数据包括：id，avatar, 和name,所以把list的每一项包装成一个对象，首先封装一个类（constractor），然后遍历获取到的数据，并实例化每个对象，对象的属性包括：id，avatar, 和name,
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        list.forEach((item, index) => {
          // 获取歌单的前10条作为热门歌曲
          if (index < HOT_SIGER_LEN) {
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }
          // 按Findex字母顺序对对象进行排序
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
          // 对象的
        })
        // 之前把数据封装成有顺序的对象， 但是对象遍历是无序的，所以还要把map转换成有序列表
        let hot = []
        let ret = []
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        // 对列表进行sort分类
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      },
      // 【二】做映射==============================
      ...mapMutations({
        // 对mutation的操作做一个映射，用一个变量映射一个操作，映射的操作名就是mutation-type中的常量
        setSinger: 'SET_SINGER'
      })
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top 88px
    bottom 0
    width 100%
</style>
