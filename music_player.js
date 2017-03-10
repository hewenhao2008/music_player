// 简化常用函数
const e = function(selector) {
    return document.querySelector(selector)
}
const eAll = function(selector) {
    return document.querySelectorAll(selector)
}
const log = function() {
    console.log.apply(console, arguments)
}

// 根据全局变量 songsList 生成歌曲列表并插入页面中
const loadSongsList = function(songsList) {
    var list = e('#id-div-songslist')
    for (var i = 0; i < songsList.length; i++) {
        var song = songsList[i]
        var t = `<div class='songslist-song'>${song}</div>`
        list.insertAdjacentHTML('beforeend', t)
    }
}

// n 为 int，意为播放前进方向的第 n 首，支持负数和 0
const playSong = function(songsList, n) {
    var audio = e('audio')
    var len = songsList.length
    var index = Number(e('audio').dataset.active)
    // 根据 retweet 和 random 的状态得到 newIndex
    if (e('.fa-random').classList.contains('controller-active')) {
        var newIndex = Math.floor(Math.random() * len)
    } else {
        var newIndex = (n + len + index) % len
    }
    // 更新 data-active
    audio.dataset.active = newIndex
    // 设置 src，重置动画，并开始播放
    audio.src = songsList[newIndex]
    e('#id-img-player').classList.remove('img-rolling')
    audio.play()
}

// 监听 click 事件到 songslist
const bindEventClickSongslist = function(songsList) {
    // 使用事件委托
    e('#id-div-songslist').addEventListener('click', function(event) {
        var target = event.target
        // 确保只响应歌曲部分的 click
        if (target.classList.contains('songslist-song')) {
            // 求出点击的歌曲在 songslist 中的 index 与当前 active 的差值
            var index = songsList.indexOf(target.innerHTML)
            var activedIndex = e('audio').dataset.active
            var n = index - activedIndex

            playSong(songsList, n)
        }
    })
}

// 点击 play 或 pause 按钮时的响应函数
const playOrPause = function(list) {
    var condition = list.contains('fa-play')
    var audio = e('audio')

    if (condition) {
        audio.play()
    } else {
        audio.pause()
        list.remove('fa-pause')
        list.add('fa-play')
    }
}
// 监听 click 事件到各个按钮
const bindEventClickButtons = function(songsList) {
    // 使用事件委托
    e('#id-div-player').addEventListener('click', function(event) {
        var list = event.target.classList
        // list-ul 按钮
        if (list.contains('fa-list-ul')) {
            e('#id-div-songslist').classList.toggle('songslist-active')
        }
        // retweet 按钮
        else if (list.contains('fa-retweet')) {
            list.toggle('controller-active')
        }
        // play 按钮
        else if (list.contains('fa-play') || list.contains('fa-pause')) {
            playOrPause(list)
        }
        // backward 按钮
        else if (list.contains('fa-backward')) {
            playSong(songsList, -1)
        }
        // forward 按钮
        else if (list.contains('fa-forward')) {
            playSong(songsList, 1)
        }
        // random 按钮
        else if (list.contains('fa-random')) {
            list.toggle('controller-active')
        }
    })
}

// 格式化时间的显示
const templatedTime = function(n) {
    var s = String(Math.floor(n % 60))
    var m = String(Math.floor(n / 60))

    if (s.length === 1) {
        s = '0' + s
    }
    if (m.length === 1) {
        m = '0' + m
    }

    return `${m}:${s}`
}
// 监听 canplay 事件到 audio
const bindEventCanplay = function(songsList) {
    var audio = e('audio')
    audio.addEventListener('canplay', function() {
        var index = Number(audio.dataset.active)
        var song = songsList[index]
        //切换图像到当前src
        e('#id-img-background').src = song.replace('.mp3', '.jpg')
        e('#id-img-player').src = song.replace('.mp3', '.jpg')
        //切换歌曲信息到当前src
        e('currenttime').innerHTML = templatedTime(0)
        e('alltime').innerHTML = templatedTime(audio.duration)
        e('songname').innerHTML = song
        // 设置滚动条信息
        e('input').min = 0
        e('input').max = audio.duration
        e('input').step = 0.1
        e('input').defaultValue = 0
    })
}
// 监听 play 事件到 audio
const bindEventPlay = function() {
    var audio = e('audio')
    audio.addEventListener('play', function() {
        // 歌曲当前时间变化，和滚动条变化
        setInterval(function() {
            e('currenttime').innerHTML = templatedTime(audio.currentTime)
            e('input').value = audio.currentTime
        }, 1000)
        //切换播放按钮形状
        e('#id-i-play').classList.remove('fa-play')
        e('#id-i-play').classList.add('fa-pause')
        //开始动画
        e('#id-img-player').classList.add('img-rolling')
        e('.img-rolling').style.animationPlayState = 'running'
    })
}
// 监听 pause 事件到 audio
const bindEventPause = function() {
    e('audio').addEventListener('pause', function() {
        e('.img-rolling').style.animationPlayState = 'paused'
    })
}
// 监听 ended 事件到 audio
const bindEventEnded = function(songsList) {
    e('audio').addEventListener('ended', function() {
        // 检查是否是最后一曲
        var condition1 = e('audio').dataset.active == songsList.length - 1
        // 检查是否激活了 retweet 按钮
        var condition2 = e('.fa-retweet').classList.contains('controller-active')
        if (condition1 && !condition2) {
            null
        } else {
            playSong(songsList, 1)
        }
    })
}

// 监听 onchange 事件到 input
const bindEventJump = function() {
    var i = e('input')
    i.addEventListener('input', function() {
        var audio = e('audio')
        audio.currentTime = i.value
    })
}

// 监听 audio 的各种状态
const bindEventAudio = function(songsList) {
    bindEventCanplay(songsList)
    bindEventPlay()
    bindEventPause()
    bindEventEnded(songsList)
    bindEventJump()
}

// 程序的统一入口
const __main = function() {
    // 存储歌曲名称到数组
    const songsList = [
        `Intro - intro.mp3`,
        `I'd Love To Change The World (Matstubs Remix).mp3`,
        `I Don't Want To Set The World On Fire.mp3`,
        `镇命歌.mp3`,
        `月光石.mp3`,
    ]
    loadSongsList(songsList)
    bindEventClickSongslist(songsList)
    bindEventClickButtons(songsList)
    bindEventAudio(songsList)
}
// 程序起点
__main()
