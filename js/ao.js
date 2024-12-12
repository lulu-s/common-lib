



// 手机端常见操作
export function initEvent() {



    // ios键盘弹起，body拉长，关闭键盘页面不回弹
    var oldScrollTop = getScrollTop() || 0; // 记录当前滚动位置
    document.body.addEventListener('focusin', function () {  //软键盘弹起事件
        // console.log("键盘弹起");
    });
    document.body.addEventListener('focusout', function () { //软键盘关闭事件
        // console.log("键盘收起");    
        var ua = window.navigator.userAgent;
        if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0) { //键盘收起页面空白问题
            document.body.scrollTop = oldScrollTop;
            document.documentElement.scrollTop = oldScrollTop;
        }
    });

    document.body.addEventListener('touchmove', function (e) {
        // // W3C
        // if (e && e.stopPropagation) {
        //     e.stopPropagation();
        // } else {
        //     // IE678
        //     window.e.cancelBubble = true;
        // }
        e.stopPropagation();
        e.preventDefault(); //阻止默认的处理方式(阻止下拉滑动的效果)
    }, { passive: false }); //passive 参数不能省略，用来兼容ios和android


    // 适配不同机型屏幕
    var scaler;
    if (document.getElementById("scaler") != null) {
        scaler = document.getElementById("scaler");
    }
    window.addEventListener("resize", function (e) {
        initWidth();
        initFontSize();
    })
    function initWidth() {
        var cw = document.documentElement.clientWidth;
        var ch = document.documentElement.clientHeight;
        if (cw < ch) {
            if (scaler) {
                scaler.style.width = cw + 'px';
                scaler.style.height = ch + 'px';
            }
        } else {
            if (scaler) {
                scaler.style.width = cw + 'px';
                // scaler.style.height = ch + 'px';
            }
        }
    }

    function initFontSize() {
        // width: 375px -> fontSize:16px
        var cw = document.documentElement.clientWidth;
        var ch = document.documentElement.clientHeight;

        if (cw < ch) {
            if (cw == 375) {
                document.documentElement.style.fontSize = '16px';
            } else {
                document.documentElement.style.fontSize = cw / 375 * 16 + 'px';
            }
        } else {
            // console.log("横屏");
        }

        // if(cw == 375 && ch == 812){
        //     document.documentElement.style.fontSize = '19px';
        // }
        // if(cw == 414 && ch > 800){
        //     document.documentElement.style.fontSize = '19px';
        // }
        // if(cw == 411 && ch > 700){
        //     document.documentElement.style.fontSize = '20px';
        // }
    }

    initWidth();
    initFontSize();



    // 禁止苹果手机缩放
    // 阻止双击放大
    var lastTouchEnd = 0;
    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    });
    document.addEventListener('touchend', function (event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // 阻止双指放大
    document.addEventListener('gesturestart', function (event) {
        event.preventDefault();
    });


}


// TODO js 常见操作


// 模糊查询
// list：需查询数组，keyWords：关键字数组
export function selectMatchItems(lists, keyWords) {
    let resArr = [];

    lists.filter((item) => {
      var status = false;
      keyWords.find((keyWord) => {
        for (let i in item) {
          if (Array.isArray(item[i])) {
            var res = item[i].find((v) => v.indexOf(keyWord) >= 0);
            if (res) {
              status = true;
              break;
            }
          } else if (typeof item[i] == "number") {
            var copy = item[i] + "";
            if (copy.indexOf(keyWord) >= 0) {
              status = true;
              break;
            }
          } else if (item[i].indexOf(keyWord) >= 0) {
            status = true;
            break;
          }
        }
        if (status) return;
      });
      if (status) resArr.push(item);
    });
    return resArr;
  }

/* 根据后缀判断文件类型 */
export function getFileType(fileName) {
	let suffix = ''; // 后缀获取
	let result = ''; // 获取类型结果
	if (fileName) {
		const flieArr = fileName.split('.'); // 根据.分割数组
		suffix = flieArr[flieArr.length - 1]; // 取最后一个
	}
	if (!suffix) return false; // fileName无后缀返回false
	suffix = suffix.toLocaleLowerCase(); // 将后缀所有字母改为小写方便操作
	// 匹配图片
	const imgList = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'svg']; // 图片格式
	result = imgList.find(item => item === suffix);
	if (result) return 'image';
	// 匹配txt
	const txtList = ['txt'];
	result = txtList.find(item => item === suffix);
	if (result) return 'txt';
	// 匹配excel
	const excelList = ['xls', 'xlsx'];
	result = excelList.find(item => item === suffix);
	if (result) return 'excel';
	// 匹配word
	const wordList = ['doc', 'docx'];
	result = wordList.find(item => item === suffix);
	if (result) return 'word';
	// 匹配pdf
	const pdfList = ['pdf'];
	result = pdfList.find(item => item === suffix);
	if (result) return 'pdf';
	// 匹配ppt
	const pptList = ['ppt', 'pptx'];
	result = pptList.find(item => item === suffix);
	if (result) return 'ppt';
	// 匹配zip
	const zipList = ['rar', 'zip', '7z'];
	result = zipList.find(item => item === suffix);
	if (result) return 'zip';
	// 匹配视频
	const videoList = ['mp4', 'm2v', 'mkv', 'rmvb', 'wmv', 'avi', 'flv', 'mov', 'm4v', 'webm'];
	result = videoList.find(item => item === suffix);
	if (result) return 'video';
	// 匹配音频
	const radioList = ['mp3', 'wav', 'wmv'];
	result = radioList.find(item => item === suffix);
	if (result) return 'radio';
	// 其他文件类型
	return 'other';
}

// 递归查找字符串并替换
function recursiveStr(obj, str) {
    for (var key in obj) {
        if (typeof obj[key] === 'string') {
            console.log(obj[key]);
            obj[key] = obj[key].replace(str, randomString(8));
        } else if (typeof obj[key] === 'object') {
            recursiveStr(obj[key], str);
        }
    }
}

recursiveStr(item, '$random');
console.log(item);

// 随机字符串
function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var pwd = '';
    for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

// 获取file
export function asyncFileReader(file) {
    return new Promise((resolve, reject) => {
        var fr = new FileReader();
        fr.onload = resolve; // CHANGE to whatever function you want which would eventually call resolve
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });
}


// 获取img
export function asyncLoadImg(file) {
    return new Promise((resolve, reject) => {
        var image = new Image();
        image.src = file;
        image.onload = resolve(image);
        image.onerror = reject;
    });
}


// json To Base64
export function jsonToBase64(object) {
    const json = JSON.stringify(object);
    return Buffer.from(json).toString("base64");
}
window.jsonToBase64 = jsonToBase64

// base64 To Json
export function base64ToJson(base64String) {
    const json = Buffer.from(base64String, "base64").toString();
    return JSON.parse(json);
}
window.base64ToJson = base64ToJson



// 设置cookie
export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

// 获取cookie
export function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}


// 获取窗口滚动条高度 
export function getScrollTop() {
    var scrollTop = 0;
    if (document.documentElement && document.documentElement.scrollTop) {
        scrollTop = document.documentElement.scrollTop;
    } else if (document.body) {
        scrollTop = document.body.scrollTop;
    }
    return scrollTop;
};


// 生成uuid
// 方法1
export function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
// 方法2
import { nanoid } from "nanoid";
export function uuid() {
    return nanoid();
}



// 校验手机号
export function isPoneAvailable(tel) {
    var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!myreg.test(tel)) {
        return false;
    } else {
        return true;
    }
}


// 获取 class 内的样式元素
export function getStyle(obj, attr) {
    var ie = !+"\v1";//简单判断ie6~8
    if (attr == "backgroundPosition") {//IE6~8不兼容backgroundPosition写法，识别backgroundPositionX/Y
        if (ie) {
            return obj.currentStyle.backgroundPositionX + " " + obj.currentStyle.backgroundPositionY;
        }
    }
    if (obj.currentStyle) {
        return obj.currentStyle[attr];
    }
    else {
        return document.defaultView.getComputedStyle(obj, null)[attr];
    }
}


// 校验对象中某个属性的数量
export function check_obj_length(obj, key, number) {
    number = number || 1;
    if (JSON.stringify(obj) !== "{}" && obj[key].length >= number) {
        return true;
    } else {
        return false;
    }
}

// 替换占位符
export function __replace_placeholder(content, old_replace, new_replace) {
    if (!content) return null;
    let tem = content.split(old_replace);
    let str = "";
    for (let i = 0; i < tem.length; i++) {
        if (i == tem.length - 1) {
            str += tem[i]
            break;
        }
        str += tem[i] + new_replace
    }
    return str;
}



// 判断对象数组的属性中是否包含重复的内容
export function check_repeat(obj, key, text) {
    for (let i = 0; i < obj.length; i++) {
        if (obj[i][key] === text) return i;
    }
    return -1;
}



// 对象数组（属性参数）求和
export function __obj_sum(obj, key) {
    let sum = 0;
    obj.forEach((o) => {
        sum += o[key];
    })
    return sum;
}

// 获取url上的参数，例子 http://ip:port/index.html#w=333
// 使用 configFromHash()['w']
export function configFromHash() {
    var h = location.hash;
    if (!h) return {};
    h = decodeURIComponent(h);
    h = h.replace("#", "");
    h = h.split(global['splitter'] || "&");
    var obj = {};
    for (var kv = 0; kv < h.length; kv++) {
        var flag = h[kv].split("=");
        if (flag.length == 1) {
            obj[flag[0]] = true;
        } else {
            obj[flag[0]] = flag[1];
        }
    }
    return obj;
}



// loop 循环, looperStart 开启循环模式, eased 递增
//tiny updatez
const PRECISION = 0.01;
var deltaT = 0;

export function ease(f, t, sp, precision) {
    precision = precision || PRECISION;
    if (Math.abs(f - t) < precision) {
        return t;
    }
    return f + (t - f) * sp * deltaT;
}

export function easeObj(f) {
    f.value = ease(f.value, f.to, f.e, f.precision);
}

export function easeArray(f, t, sp, precision) {
    for (var i = 0; i < f.length; i++) {
        f[i] = ease(
            f[i],
            Array.isArray(t) ? t[i] : t,
            Array.isArray(sp) ? sp[i] : sp,
            Array.isArray(precision) ? precision[i] : precision
        );
    }
}

var _eased_values = [];

export function eased(v, t, e, prec) {
    return new EasedValue(v, t, e, prec);
}

export class EasedValue {
    constructor(value, to, e, precision) {
        this.value = value;
        this.to = to;
        this.precision = precision || PRECISION;
        this.e = e;
        _eased_values.push(this);
        this.updating = true;
    }
    valueOf() {
        return this.value;
    }
    tick() {
        this.value = ease(this.value, this.to, this.e, this.precision);
    }
    toString() {
        return this.value.toString();
    }
    set(v) {
        this.value = v;
    }
    target(v) {
        this.to = v;
    }
}

export var deltaTMultipler = 60;

export function looperSetDeltaTMultiplier(s) {
    deltaTMultipler = s;
}

var all = [];
var removal = [];
export var t = (Date.now() / 1000) % 1000000;
export var prevT = (Date.now() / 1000) % 1000000;
export function tick() {
    deltaT = (t - prevT) * deltaTMultipler;
    prevT = t;
    if (deltaT < 0) {
        deltaT = 1;
    }
    if (deltaT > 3) {
        deltaT = 1;
    }
    t = ((Date.now()) % 1000000) * 0.001;
    if (removal.length > 0) {
        var _new = [];
        for (var i = 0; i < all.length; i++) {
            if (removal.indexOf(all[i]) >= 0) {
                continue;
            }
            _new.push(all[i]);
        }
        removal = [];
        all = _new;
    }
    for (var i = 0; i < all.length; i++) {
        all[i](t, deltaT);
    }
}

export function loop(func_or_obj) {
    var func = func_or_obj.update || func_or_obj;
    if (all.indexOf(func) >= 0) {
        return;
    }
    all.push(func);
}

export function noLoop(func) {
    if (removal.indexOf(func) >= 0) {
        return;
    }
    removal.push(func);
}

export function looperStart() {
    var _updator_thread = function () {
        requestAnimationFrame(_updator_thread);
        tick();
    };
    _updator_thread();
}

var _keys = {};
export function looperInterval(key, span) {
    _keys[key] = _keys[key] || Date.now();
    if (Date.now() > _keys[key] + span) {
        _keys[key] = Date.now();
        return true;
    }
    return false;
}

function _update_eased() {
    for (var i = 0; i < _eased_values.length; i++) {
        _eased_values[i].tick();
    }
}
loop(_update_eased);

var _value_lib = {};
var _value_keys = {};
export function changed(key, cur) {
    var changed = _value_lib[key] != cur;
    _value_lib[key] = cur;
    _value_keys[key] = 1;
    return changed;
}



