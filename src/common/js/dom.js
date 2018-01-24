// 给dom元素添加新的样式
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }
  // 如果没有这个样式，先将dom的样式名拆分成数组，然后push进新的样式后，再链接起来
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

// 判断有无此样式
export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el, className)
}

// 获取被点击元素某属性值, 属性用:data-name标明，常用设计
export function getData(el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    // 有值获取get
    return el.setAttribute(name, val)
  } else {
    // 没值赋值set
    return el.getAttribute(name)
  }
}

// 解决浏览器样式兼容性
// 一：利用浏览器的能力检测特性，先创建一个domStyle
let elementStyle = window.document.createElement('div').style

// 二：定义供应商及对应的属性名，通过遍历数组确定当前使用的浏览器供应商
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()

// 如果未找到供应商，则出错，否则按照“供应商名称+样式属性名(首字母大写)”的规则拼接、
// 参数是未加前缀的样式属性名
export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }
  if (vendor === 'standard') {
    return style // 没有其他前缀的标准样式属性名
  }
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
