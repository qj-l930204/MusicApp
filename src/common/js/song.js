import {getLyric} from 'api/song'
import {Base64} from 'js-base64'
import {ERR_OK} from 'api/config'
// 构造类
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
// 获取歌词并解码
  getLyric() {
    if (this.lyric) {
      // lyric本身返回的就是一个Promise的对象，所以对getLyric函数也需要做一层封装
      return Promise.resolve(this.lyric)
    }
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (typeof res === 'string') {
          var reg = /^\w+\(({[^()]+})\)$/
          var matches = res.match(reg)
          if (matches) {
            // matches[1]必须是字符串格式：{"code":0,"msg":"姓名不能为空！","data":"","url":"","wait":3}，否则json会解析错误
            res = JSON.parse(matches[1])
          }
        }
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          // 需要在eslintrc.js配置prefer-promise-reject-errors
          reject('no lyric')
        }
      })
    })
  }
}

// 工厂方式实例化
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filter(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R150x150M000${musicData.albummid}.jpg?max_age=2592000`, // 图片链接是拼接而来的
    url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=38` // 可以播放的源有多个，这是其中的一个源
    // url: `https://thirdparty.gtimg.com/${musicData.songid}.m4a?gromtag=38`
  })
}
// 歌手的接口中是数组，我们要转化成字符串
function filter(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  // 歌手名称之间用“/”分割
  return ret.join('/')
}
