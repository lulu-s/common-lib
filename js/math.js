// 转换日期
export function get_my_date(str) {
    var oDate = new Date(str),
        oYear = oDate.getFullYear(),
        oMonth = oDate.getMonth() + 1,
        oDay = oDate.getDate(),
        oHour = oDate.getHours(),
        oMin = oDate.getMinutes(),
        oSen = oDate.getSeconds(),
        oTime = oYear + '-' + add_zero(oMonth) + '-' + add_zero(oDay) + ' ' + add_zero(oHour) + ':' + add_zero(oMin) + ':' + add_zero(oSen);
    //return oTime;
    return {
        years: oYear,
        months: oMonth,
        days: oDay,
        hours: oHour,
        minutes: oMin,
        seconds: oSen,
        time: oTime,
        ms: oDate.getTime()
    }
}

//补零操作
export function add_zero(num) {
    if (parseInt(num) < 10) {
        num = '0' + num;
    }
    return num;
}



// 金钱符号，每三个数字间加,
// add_comma(100000)
// '100,000'
export function add_comma(number) {
    if (number && number != null) {
        number = String(number);
        var left = number.split(".")[0];
        // right = number.split('.')[1];
        // right = right ? (right.length >= 2 ? '.' + right.substr(0, 2) : '.' + right + '0' ) : '.00';
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
        ); // + right;
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
        return add_zero(hour) + ":" + add_zero(min) + ":" + add_zero(sec);
    } else {
        min = Math.floor(cur / 60);
        sec = Math.floor(cur % 60);
        return add_zero(min) + ":" + add_zero(sec);
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
export function get_char_appear_len(str, char){
  var len = str.split(char).length-1
  return len;
}
// get_char_appear_len('abc#def#hig', '#') // 2
