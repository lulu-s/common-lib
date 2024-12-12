function get_img_src(
    imgStr = "<p><img src='http://www.baidu.com/FpmF-JifNksQTHo7InP_LMukbtWc'/></p>"
) {
    //解析富文本获取img里面的src属性值 
    var patt = /<img[^>]+src=['"]([^'"]+)['"]+/g;
    var result = [],
        temp;
    while ((temp = patt.exec(imgStr)) != null) {
        result.push({ 'url': temp[1] });
    }
    console.log(result)
}