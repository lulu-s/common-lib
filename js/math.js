// delay函数 sleep(1000) 毫秒
export function sleep(delay) {
    var start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {
        // 使用  continue 实现；
        continue;
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
        years: oYear,
        months: oMonth,
        days: oDay,
        hours: oHour,
        minutes: oMin,
        seconds: oSen,
        time: oTime,
        ms: oDate.getTime(),
        time12: o12Time,
        week: oWeek
    }
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



// UTC时间转换任意时区时间
// 世界时区表：https://www.bbkz.com/guide/index.php/%E4%B8%96%E7%95%8C%E5%90%84%E5%9C%8B%E6%99%82%E5%8D%80
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
