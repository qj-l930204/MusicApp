import {commonParams} from './config'
import axios from 'axios'

export function getLyric(mid) {
  const url = '/api/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  const data = Object.assign({}, commonParams, {
    pcachetime: +new Date(),
    songmid: mid,
    hostUin: 0,
    loginUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((response) => {
    return Promise.resolve(response.data)
  }).catch((e) => {
    console.log(e)
  })
}
