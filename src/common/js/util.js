// 打乱有序歌单数组
// 首先获取一个长度与歌单长度相等的随机整数数组，包括max和min在内，作为新歌单的下标
function getRandomInt(min, max) {
  // random是不含1的随机小数，max-min+1是为了得到与上限相等的值，+min是整体放大随机数，使得 max > 随机数 >min，最后向下取整
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 将新生成的虽说技术作为新的下标赋给歌单
export function shuffle(arr) {
  // 复制一个arr参数，使得函数修改的是_arr，而不是参数本身，这样不会产生副作用：使用时arr歌单改变后无法确定选择正确的歌，用_arr则不会改变原歌单的顺序
  // 因为我们所需要的只是一个随机的新歌单，如果直接改变传入的play歌单，而展示界面上显示的还是原来的顺序歌单，那么在选择歌曲播放的时候播放的就不是选择的歌曲，而是被选择歌曲的下标i所对应的新的歌曲
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) { // i表示原歌单下标：即遍历的是歌单，eg：arr[0]=>演员、arr[1]=>像风一样、arr[2]=>背过手、arr[3]=>暧昧。。。
    let j = getRandomInt(0, i) // j是随机数：0、3、5、7、9、11、13、15...也表示原歌单下标，用来获取原歌单项，eg：eg：arr[0]=>演员、arr[3]=>暧昧。。。
    // 将随机获取的歌单项与顺序获取的歌单项做替换，生成新歌单：arr[0]=>演员、arr[1]=>暧昧。。。
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

// 节流函数,原理：传入执行函数，返回节流函数
export function debounce(func, delay) {
  let timer

  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
