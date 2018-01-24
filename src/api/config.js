export const commonParams = {
  g_tk: 5381,
  inCharset: 'utf8',
  outCharset: 'utf-8',
  notice: 0,
  format: 'jsonp'
}

export const options = {
  param: 'jsonpCallback' // 这句话定义了jsonp的名称，这个名称需要接受返回的函数名,默认：__jpn()
}

//   name: 'playlistinfoCallback' // 返回函数名  非默认：callback = playlistinfoCallback

export const ERR_OK = 0
