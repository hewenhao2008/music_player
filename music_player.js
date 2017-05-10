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

    return m + ":" + s
}
// 格式化歌曲信息的显示
const showInfo = function(songsList) {
    // 取出当前载入的歌曲在 songslist 中的索引
    var index = e('audio').dataset.active
    // 取出歌名
    var song = songsList[index]
    // 设置图像信息
    e('#id-img-background').src = song.replace('.mp3', '.jpg')
    e('#id-img-player').src = song.replace('.mp3', '.jpg')
    // 设置歌曲时长及名称
    e('currenttime').innerHTML = templatedTime(0)
    e('alltime').innerHTML = templatedTime(0)
    //去除.mp3后缀的显示
    e('songname').innerHTML = song.replace('.mp3','')
    // 将动画置于初始状态
    e('#id-img-player').classList.remove('img-rolling')
}
// 返回当前的播放模式
const modeOfPlay = function() {
    if (e('.fa-random').classList.contains('controller-active')) {
        return 'random'
    } else if (e('.fa-retweet').classList.contains('controller-active')) {
        return 'circle-list'
    } else {
        return 'none'
    }
}
// 初始化程序
const initialPlayer = function(songsList) {
    // 设置 audio 的各个属性值
    var a = e('audio')
    var len = songsList.length
    a.src = songsList[0]
    a.dataset.songs = len
    a.dataset.active = 0
    // 初始化歌曲列表
    var list = e('#id-div-songslist')
    for (var i = 0; i < len; i++) {
         //去除.mp3后缀的显示
        var song = songsList[i].replace('.mp3','')
        var t = "<div class='songslist-song'>" +song + '</div>'
        list.insertAdjacentHTML('beforeend', t)
    }
    // 展示歌曲信息
    showInfo(songsList)
        //显示播放列表
       e('#id-div-songslist').classList.toggle('slideOutLeft')
       e('#id-div-songslist').classList.toggle('slideInLeft')
}

// 歌曲切换时调用的函数 playSong
const playSong = function(songsList, index, playmode = 'none') {
    /*
    index 为 int，表示即将播放的歌曲在 songsList 中的索引
    playmode 为 string，有 none circle-list circle-one random 四种取值
    */
    var a = e('audio')
    var n = Number(a.dataset.songs)
    if (playmode === 'random') {
        var i = Math.floor(Math.random() * n)
    } else {
        var i = ((index % n) + n ) % n
    }
    a.dataset.active = i
    // 根据 retweet 和 random 的状态得到 playmode 的值
    // if (e('.fa-random').classList.contains('controller-active')) {
    //     var newActive = Math.floor(Math.random() * len)
    // } else {
    //     var newActive = (n + len + index) % len
    // }
    // 更新 data-active，并展示歌曲信息
    showInfo(songsList)
    // 设置 audio，开始播放
    a.src = songsList[i]
    a.play()
}

// 监听 click 事件到 songslist
const bindEventClickSongslist = function(songsList) {
    // 使用事件委托
    e('#id-div-songslist').addEventListener('click', function(event) {
        var target = event.target
        // 确保只响应歌曲部分的 click
        if (target.classList.contains('songslist-song')) {
            // 求出点击的歌曲在 songslist 中的 index //加回.mp3后缀
            var index = songsList.indexOf(target.innerHTML + ".mp3")
            // 调用播放函数
            playSong(songsList, index)
            // 隐藏 songslist
            e('#id-div-songslist').classList.toggle('slideInLeft')
            e('#id-div-songslist').classList.toggle('slideOutLeft')
        }
    })
}

// 点击 play 或 pause 按钮时的响应函数
const playOrPause = function(list) {
    var condition = list.contains('fa-play')
    var a = e('audio')

    if (condition) {
        a.play()
    } else {
        a.pause()
        list.remove('fa-pause')
        list.add('fa-play')
    }
}
// 监听 click 事件到各个按钮
const bindEventClickButtons = function(songsList) {
    // 使用事件委托
    e('#id-div-player').addEventListener('click', function(event) {
        var index = Number(e('audio').dataset.active)
        var list = event.target.classList
        // list-ul 按钮
        if (list.contains('fa-list-ul')) {
            e('#id-div-songslist').classList.toggle('slideInLeft')
            e('#id-div-songslist').classList.toggle('slideOutLeft')
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
            playSong(songsList, index - 1, modeOfPlay())
        }
        // forward 按钮
        else if (list.contains('fa-forward')) {
            playSong(songsList, index + 1, modeOfPlay())
        }
        // random 按钮
        else if (list.contains('fa-random')) {
            list.toggle('controller-active')
        }
    })
}

// 监听 canplay 事件到 audio
const bindEventCanplay = function(songsList) {
    var a = e('audio')
    a.addEventListener('canplay', function() {
        // 设置歌曲时长信息
        e('alltime').innerHTML = templatedTime(a.duration)
        // 设置滚动条信息
        e('input').max = a.duration
    })
}
// 监听 play 事件到 audio
const bindEventPlay = function() {
    var a = e('audio')
    a.addEventListener('play', function() {
        // 歌曲当前时间变化，和滚动条变化
        setInterval(function() {
            e('currenttime').innerHTML = templatedTime(a.currentTime)
            e('input').value = a.currentTime
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
    var a = e('audio')
    a.addEventListener('ended', function() {
        // 检查是否是最后一曲
        var condition1 = a.dataset.active == songsList.length - 1
        // 检查是否激活了 retweet 按钮
        var condition2 = e('.fa-retweet').classList.contains('controller-active')
        if (condition1 && !condition2) {
            null
        } else {
            var index = Number(a.dataset.active)
            playSong(songsList, index + 1, modeOfPlay())
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
        'I Don\'t Want To Set The World On Fire.mp3',
        '镇命歌.mp3',
        'I\'d Love To Change The World (Matstubs Remix).mp3',
        'Intro - intro.mp3',
        '月光石.mp3',
    ]
    initialPlayer(songsList)
    bindEventClickSongslist(songsList)
    bindEventClickButtons(songsList)
    bindEventAudio(songsList)
}
// 程序起点
__main()
