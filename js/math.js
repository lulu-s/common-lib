
// 根据经纬度计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
function rad(d) {
    return d * Math.PI / 180.0;
}
function getDistances(lat1, lng1, lat2, lng2) {

    var radLat1 = rad(lat1);
    var radLat2 = rad(lat2);
    var a = radLat1 - radLat2;
    var b = rad(lng1) - rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    // 输出为公里
    s = Math.round(s * 10000) / 10000;

    var distance = s;
    var distance_str = "";

    if (parseInt(distance) >= 1) {
        // distance_str = distance.toFixed(1) + "km";
        distance_str = distance.toFixed(2) + "km";
    } else {
        // distance_str = distance * 1000 + "m";
        distance_str = (distance * 1000).toFixed(2) + "m";
    }

    //s=s.toFixed(4);

    // console.info('距离是', s);
    // console.info('距离是', distance_str);
    // return s;

    //小小修改，这里返回对象
    let objData = {
        distance: distance,
        distance_str: distance_str
    }
    return objData
}





// delay函数 sleep(1000) 毫秒
export function sleep(delay) {
    var start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {
        // 使用  continue 实现；
        continue;
    }
}

// js：秒转换为小时分钟秒格式
// https://blog.csdn.net/weixin_43566662/article/details/127478102
function formatTime(time) {

    var hours = Math.floor(time / 3600);

    var minutes = Math.floor(Math.floor(time % 3600) / 60);

    var seconds = Math.floor(time % 60);

    var h = hours.toString().length === 1 ? `0${hours}` : hours;

    var m = minutes.toString().length === 1 ? `0${minutes}` : minutes;

    var s = seconds.toString().length === 1 ? `0${seconds}` : seconds;

    return `${h} 小时 ${m} 分钟 ${s} 秒`;

}


// 十二时辰
export function get_hour12(hour, minute, seconds) {
    // 十二时辰按照地支，十二属相排列
    let tzArr = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    // 十二时辰对应
    let sdArr = ['夜半', '鸡鸣', '平旦', '日出', '食时', '隅中', '日平', '日昳', '晡时', '日入', '黄昏', '人定']
    // 一个时辰为八刻
    let skArr = ['一', '二', '三', '四', '五', '六', '七', '八']

    // 判断时刻
    var sk = ''
    var tz = tzArr[parseInt(hour / 2)] + '时';
    var sd = sdArr[parseInt(hour / 2)];
    if (hour % 2 === 0) {
        sk += skArr[parseInt(minute / 15)]
    } else if (hour % 2 === 1) {
        sk += skArr[parseInt(minute / 15) + 4]
    }
    sk += '刻'
    var shichenStr = `${tz}（${sd}）${sk}`
    return {
        tz,
        sd,
        sk,
        shichenStr
    }

}




// 转换日期
export function get_my_date(str = Date.now()) {
    var oDate = new Date(str),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oHour = oDate.getHours(),
        oMin = oDate.getMinutes(),
        oSen = oDate.getSeconds(),
        oTime = oYear + '-' + add0(oMonth) + '-' + add0(oDay) + ' ' + add0(oHour) + ':' + add0(oMin) + ':' + add0(oSen);

    var o12Time = oDate.toLocaleString('zh', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    })

    var oWeek = "日一二三四五六".charAt(oDate.getDay());

    //return oTime;
    return {
        year: oYear,
        month: oMonth,
        day: oDay,
        hour: oHour,
        minute: oMin,
        seconds: oSen,
        time: oTime,
        ms: oDate.getTime(),
        time12: o12Time,
        week: oWeek,
        today: oYear + '-' + oMonth + '-' + oDay
    }
}


// 天干地支
// https://blog.51cto.com/liuhao9999/5089789
export function getDayGanZhiByDate(year, month, day) {
    //  1900 3  1  癸酉
    var date = new Date();
    date.setFullYear(1900);
    date.setMonth(2);
    date.setDate(1);
    date.setHours(12);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    var date1 = new Date();
    date1.setFullYear(year);
    date1.setMonth(month - 1);
    date1.setDate(day);
    date1.setHours(12)
    date1.setMinutes(0)
    date1.setSeconds(0)
    date1.setMilliseconds(0)
    var days = Math.round((date1.getTime() - date.getTime()) / 1000 / 60 / 60 / 24)
    console.log("days----", days)
    var tianGan = ["癸", "甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬"]
    var diZhi = ["酉", "戌", "亥", "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申"]
    var ganZhi = tianGan[days % 10] + diZhi[days % 12];
    return ganZhi
}

/**
 * 时间戳 
 * @returns 20230816115805 
 */
export function timestamp() {
    var time = new Date();
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return "" + y + add0(m) + add0(d) + add0(h) + add0(mm) + add0(s);
}

//补零操作
export function add0(num) {
    if (parseInt(num) < 10) {
        num = '0' + num;
    }
    return num;
}


// 金钱符号，每三个数字间加,
// add_comma(100000)
// '100,000'
export function add_comma(number, dec) {
    if (number && number != null) {
        number = String(number);
        var left = number.split(".")[0];
        var right = number.split('.')[1];
        right = right ? (right.length >= 1 ? '.' + right.substr(0, 2) : '.' + right + '0') : '';

        var temp = left
            .split("")
            .reverse()
            .join("")
            .match(/(\d{1,3})/g);
        return (
            (Number(number) < 0 ? "-" : "") +
            temp
                .join(",")
                .split("")
                .reverse()
                .join("")
        ) + (dec ? right : '');
    } else if (number === 0) {
        return "0.00";
    } else {
        return "";
    }
}



// 时间格式 转换成 秒 例: 00:10:22 或 50:20
// time_convert_second('01:00:00') 
// 3600
export function time_convert_second(time) {
    if (time.indexOf(":") < 0) return 0;
    let len = time.split(":").length - 1;

    let hour, min, sec;
    if (len == 2) {
        hour = Number(time.split(":")[0]);
        min = Number(time.split(":")[1]);
        sec = Number(time.split(":")[2]);
        return hour * 3600 + min * 60 + sec;
    } else {
        min = Number(time.split(":")[0]);
        sec = Number(time.split(":")[1]);
        return min * 60 + sec;
    }
}


// 时间进度，转换为时间格式。
// 例： 当前视频进度为 30%，视频长度 30秒。 即 time_map = 0.3 end_time = 00:30
// get_time_format(.3, '00:30')
// '00:09'
export function get_time_format(time_map, end_time) {
    let end = time_convert_second(end_time);
    let cur = time_map * end;
    let len = end_time.split(":").length - 1;

    let hour, min, sec;
    if (len == 2) {
        hour = Math.floor(cur / 3600);
        min = Math.floor((cur % 3600) / 60);
        sec = Math.floor(cur % 60);
        return add0(hour) + ":" + add0(min) + ":" + add0(sec);
    } else {
        min = Math.floor(cur / 60);
        sec = Math.floor(cur % 60);
        return add0(min) + ":" + add0(sec);
    }
}



// 时间 秒 转 00:00:00
// formatTime(10)
// '00:10'
export function formatTime(millisecond) {
    // 转换为式分秒
    let h = parseInt(time / 60 / 60 % 24)
    h = h < 10 ? '0' + h : h
    let m = parseInt(time / 60 % 60)
    m = m < 10 ? '0' + m : m
    let s = parseInt(time % 60)
    s = s < 10 ? '0' + s : s
    // 作为返回值返回
    return `${h}:${m}:${s}` //[h, m, s]
}

// UTC时间转换任意时区时间
// 世界时区表：https://www.bbkz.com/guide/index.php/%E4%B8%96%E7%95%8C%E5%90%84%E5%9C%8B%E6%99%82%E5%8D%80
// 使用：utcToOffset(new Date().toISOString(), 8);
export function utcToOffset(utc_datetime, offset) {

    // 转为正常的时间格式 年-月-日 时:分:秒
    var T_pos = utc_datetime.indexOf('T');
    var Z_pos = utc_datetime.indexOf('Z');
    var year_month_day = utc_datetime.substr(0, T_pos);
    var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
    var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06

    // 处理成为时间戳
    timestamp = new Date(Date.parse(new_datetime));
    timestamp = timestamp.getTime();
    timestamp = timestamp / 1000;

    // 增加 offset 个小时，例如 北京时间比utc时间多八个时区，offset = 8
    var timestamp = parseInt(timestamp + offset * 60 * 60) * 1000;
    return get_my_date(timestamp).time;
}


// 角度从度数转换为弧度数。
export function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}
// degrees_to_radians(45) // 0.7853981633974483


// JS判断字符串中，某个字符出现的次数 
export function get_char_appear_len(str, char) {
    var len = str.split(char).length - 1
    return len;
}
// get_char_appear_len('abc#def#hig', '#') // 2



/** 
 *  判断一个点是否在圆的内部 
 *  @param point  测试点坐标 
 *  @param circle 圆心坐标 
 *  @param r 圆半径 
 *  返回true为真，false为假 
 *  */
function pointInsideCircle(point, circle, r) {
    if (r === 0) return false
    var dx = circle[0] - point[0]
    var dy = circle[1] - point[1]
    return dx * dx + dy * dy <= r * r
}



/** 
 *  判断一个点是否在多边形内部 
 *  @param points 多边形坐标集合 
 *  @param testPoint 测试点坐标 
 *  返回true为真，false为假 
 *  */
function insidePolygon(points, testPoint) {
    var x = testPoint[0], y = testPoint[1];
    var inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
        var xi = points[i][0], yi = points[i][1];
        var xj = points[j][0], yj = points[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
