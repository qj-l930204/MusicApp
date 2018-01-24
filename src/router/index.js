import Vue from 'vue'
import Router from 'vue-router'
// import Recommend from 'components/recommend/recommend'
// import Singer from 'components/singer/singer'
// import Rank from 'components/rank/rank'
// import Search from 'components/search/search'
// import SingerDetail from 'components/singer-detail/singer-detail'
// import Disc from 'components/disc/disc'
// import TopList from 'components/top-list/top-list'
// import UserCenter from 'components/user-center/user-center'

Vue.use(Router)

// 异步加载路由组件
const Recommend = (resolve) => {
  import('components/recommend/recommend').then((routerName) => {
    resolve(routerName)
  })
}
const Singer = (resolve) => {
  import('components/singer/singer').then((routerName) => {
    resolve(routerName)
  })
}
const Rank = (resolve) => {
  import('components/rank/rank').then((routerName) => {
    resolve(routerName)
  })
}
const Search = (resolve) => {
  import('components/search/search').then((routerName) => {
    resolve(routerName)
  })
}
const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail').then((routerName) => {
    resolve(routerName)
  })
}
const Disc = (resolve) => {
  import('components/disc/disc').then((routerName) => {
    resolve(routerName)
  })
}
const TopList = (resolve) => {
  import('components/top-list/top-list').then((routerName) => {
    resolve(routerName)
  })
}
const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((routerName) => {
    resolve(routerName)
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      name: 'Recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          name: 'Disc',
          component: Disc
        }
      ]
    },
    {
      path: '/singer',
      name: 'Singer',
      component: Singer,
      children: [
        {
          path: ':id', // id动态传入
          name: 'singerDetail',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/rank',
      name: 'Rank',
      component: Rank,
      children: [
        {
          path: ':id',
          name: 'TopList',
          component: TopList
        }
      ]
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
      children: [
        {
          path: ':id', // id动态传入
          // name: 'singerDetail', // 有name就不能重复
          component: SingerDetail
        }
      ]
    },
    {
      path: '/user',
      name: 'UserCenter',
      component: UserCenter
    }
  ]
})
