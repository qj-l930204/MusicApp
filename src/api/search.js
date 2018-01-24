import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'

export function getHotSong() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    format: 'jsonp',
    platform: 'h5',
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

// 变化的参数需要传递进来，固定不变的可以直接设置在data里
export function search(query, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    format: 'jsonp',
    platform: 'h5',
    needNewCode: 1,
    w: query,
    zhidaqu: 1,
    catZhida: zhida ? 0 : 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage: perpage,
    n: perpage,
    p: page,
    remoteplace: 'txt.mqq.all'
  })

  return jsonp(url, data, options)
}
