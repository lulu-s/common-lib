

// TODO canvas
function drawRoundRect(cxt, x, y, width, height, radius) {
    cxt.beginPath();
    cxt.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    cxt.lineTo(width - radius + x, y);
    cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    cxt.lineTo(width + x, height + y - radius);
    cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    cxt.lineTo(radius + x, height + y);
    cxt.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    cxt.closePath();
}


// 鼠标 转换 canvas坐标
var rect = null;
export function coordinate(e) {
    // 画布的大小
    if (!rect) {
        // canvas
        rect = canvas.getBoundingClientRect();
    }
    env.dpi = canvas.width + "-" + width;
    // console.log(rect);
    var //鼠标所在位置
        ex = e.clientX || e.changedTouches[0].clientX,
        ey = e.clientY || e.changedTouches[0].clientY,
        //鼠标相对于画布的位置
        tx = ex - rect.left - document.documentElement.clientLeft,
        ty = ey - rect.top - document.documentElement.clientTop;
    //鼠标坐标转换成画布坐标系
    tx = (tx * canvas.width) / rect.width;
    ty = (ty * canvas.height) / rect.height;
    // console.log("原始坐标" + tx, ty);
    return { x: tx, y: ty };
}



// 画折线
export function drawBrokenLine(ctx, points, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }
  
  
