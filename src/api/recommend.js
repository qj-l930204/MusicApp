import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'

// 获取轮播图的数据,jsonp请求
export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0, // 不传的话默认为0
    needNewCode: 1
  })

  return jsonp(url, data, options)
}
// 获取歌手数据，json
export function getDiscList() {
  const url = '/api/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  const data = Object.assign({}, commonParams, {
    picmid: 1,
    rnd: Math.random(),
    hostUin: 0,
    format: 'json',
    platform: 'yqq',
    needNewCode: 0,
    categoryId: 10000000,
    sortId: 5,
    sin: 0,
    ein: 29
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

// 获取网易云歌单数据，ajax请求
// export function getDiscList1() {
//   const url = '/api/netease/playlist'
//   return axios.get(url, {
//     params: {
//       id: '222222'
//     },
//     headers: {
//       // referer: 'https://github.com/xCss/JsonBird/wiki'
//     }
//   }).then((res) => {
//     return Promise.resolve(res)
//   })
// }

// 通过php接口获取qq音乐歌单的数据,json请求
// export function getDiscList2() {
//   const url = '/test/test_php/mm.php'
//   return axios.get(url).then((res) => {
//     return Promise.resolve(res.data)
//   })
// }
// 获取网易云歌单数据，ajax请求
// export function getDiscList1() {
//   const url = '/api/netease/playlist'
//   return axios.get(url, {
//     params: {
//       id: '222222'
//     },
//     headers: {
//       // referer: 'https://github.com/xCss/JsonBird/wiki'
//     }
//   }).then((res) => {
//     return Promise.resolve(res)
//   })
// }
