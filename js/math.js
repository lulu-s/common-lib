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