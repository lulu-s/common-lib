

// qq地图逆地址解析
// 保时捷小程序 key = 667BZ-VWELV-M3FP5-5H4FG-MDPGK-XXFXJ
// var res = await TMapAddToLat(address)
function TMapAddToLat(address) {
    console.log(address);

    var script = document.createElement('script');
    return new Promise(function (resolve, reject) {
        window.handleResponse = function (data) {
            document.body.removeChild(script);
            alert(JSON.stringify(data))
            resolve(data)
        }
        let url = 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + address + '&key=667BZ-VWELV-M3FP5-5H4FG-MDPGK-XXFXJ&output=jsonp&callback=handleResponse&get_poi=1';

        script.src = url;
        document.body.appendChild(script);
    })
}



// 地址解析
async function getLonAndLat(address) { 
    var res = await (await fetch('https://apis.map.qq.com/ws/geocoder/v1/?address=' + address + '&key=667BZ-VWELV-M3FP5-5H4FG-MDPGK-XXFXJ')).json();
    return {
        res: res,
        location: res.result.location
    };
};
